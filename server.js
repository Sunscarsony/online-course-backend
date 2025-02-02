require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


app.post('/create-order', async (req, res) => {
  try {
    const { name, email, phone, user_type, amount } = req.body;
    if (!name || !email || !phone || !user_type || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: 'receipt#1',
    });

    if (!razorpayOrder || !razorpayOrder.id) {
      return res.status(500).json({ error: 'Error creating Razorpay order' });
    }

    const order_id = razorpayOrder.id;
    console.log('Received order id:', order_id);

    const payload = [{
      order_id,
      name,
      email,
      phone,
      user_type,
      amount,
      status: 'Pending',
    }];
    console.log('Insert payload:', payload);

    const { data, error } = await supabase
      .from('payment')
      .insert(payload)
      .select(); 

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: error.message || 'Database insert error' });
    }

    console.log('Supabase insert data:', data);
    return res.json({ order_id });
  } catch (err) {
    console.error('Error in /create-order:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/verify-payment', async (req, res) => {
  try {
    const { order_id, payment_id, name, email } = req.body;
    if (!order_id || !payment_id || !name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('payment')
      .update({ payment_id, status: 'Success' })
      .eq('order_id', order_id);

    if (error) {
      console.error('Supabase update error:', error);
      return res.status(500).json({ error: error.message || 'Database update error' });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Payment Successful!',
      html: `
        <h2>Payment Successful!</h2>
        <p>Hello <b>${name}</b>,</p>
        <p>Your payment was successful.</p>
        <p><b>Order ID:</b> ${order_id}</p>
        <p><b>Payment ID:</b> ${payment_id}</p>
        <p>Thank you for purchasing the course <b>Freelancing 101</b>!</p>
        <p>You can access the course materials <a href="https://drive.google.com/drive/folders/1clk5qVSybTUnN8mIyROIeqVkTt83PnTz?usp=sharing" target="_blank">here</a>.</p>
      `,
    };

    transporter.sendMail(mailOptions, (mailErr, info) => {
      if (mailErr) {
        console.error('Error sending email:', mailErr);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    return res.sendStatus(200);
  } catch (err) {
    console.error('Error in /verify-payment:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
