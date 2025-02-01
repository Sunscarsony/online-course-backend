const nodemailer = require("nodemailer");

const sendEmail = async (email, name, orderId, paymentId) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"Online Course Platform" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Payment Successful - Course Purchase",
    html: `
<h2>Payment Successful!</h2>
<p>Hello <b>${name}</b>,</p>
<p>Your payment was successful.</p>
<p><b>Order ID:</b> ${orderId}</p>
<p><b>Payment ID:</b> ${paymentId}</p>
<p>Thank you for purchasing the course <b>Freelancing 101</b>!</p>
<p>This course is designed to help you build a strong personal brand as a freelancer and succeed in the gig economy. It provides practical strategies, tools, and exercises to help you discover your niche, craft a unique selling proposition, and create a powerful online presence that attracts clients.</p>
<p>You can access the course materials using the link below:</p>
<p><a href="https://drive.google.com/drive/folders/1clk5qVSybTUnN8mIyROIeqVkTt83PnTz?usp=sharing" target="_blank">Access Course Materials</a></p>
<p>Happy learning!</p>
`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;
