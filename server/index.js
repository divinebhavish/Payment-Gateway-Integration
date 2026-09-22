const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto")
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

// CORS
app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type"],
    })
);

// Body parser, Middle ware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// Test route
app.get("/", (req, res) => {
    res.send("Backend is working!");
});


// Create Razorpay order
app.post("/order", async (req, res) => {

    console.log("POST /order received");
    console.log("Request body:", req.body);

    try {

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET
        });

        const { amount, currency, receipt } = req.body;

        const order = await razorpay.orders.create({
            amount,
            currency,
            receipt
        });

        console.log("Razorpay order created:", order);

        if (!order) {
            return res.status(500).json({
                message: "Order creation failed"
            });
        }

        return res.status(200).json(order);

    } catch (error) {

        console.error("RAZORPAY ERROR:");
        console.error(error);

        return res.status(500).json({
            message: "Failed to create Razorpay order",
            error: error.message
        });
    }
});

app.post("/order/validate", async ( req, res ) => {
    const{ razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);

    sha.update(`${ razorpay_order_id }|${ razorpay_payment_id }`)

    const digest = sha.digest("hex");

    if ( digest !== razorpay_signature ){
        return res.status(400).json({
            message: "Validation failed, Transaction is not legit" 
        });
    }

    res.json({
        message: "Successfull Transaction",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
    })



})


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});