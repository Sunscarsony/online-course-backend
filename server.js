const express = require("express");
const cors = require("cors");
require("dotenv").config();
const sendEmail = require("./routes/sendEmail");

const app = express();
app.use(express.json());
app.use(cors()); 

app.post("/api/sendEmail", async (req, res) => {
    const { email, name, orderId, paymentId } = req.body;
    
    try {
        await sendEmail(email, name, orderId, paymentId);
        res.status(200).json({ message: "Email Sent Successfully" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Email Sending Failed" });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
