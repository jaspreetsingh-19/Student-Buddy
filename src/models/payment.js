import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    paymentId: String,
    orderId: String,
    signature: String,
    amount: Number, // in rupees
    currency: {
        type: String,
        default: "INR",
    },
    premiumType: {
        type: String, // "monthly" or "yearly"
        enum: ["free", "monthly", "yearly"],
        required: true,
    },
    status: {
        type: String,
        enum: ["success", "pending"],
        default: "success",
    },
    paidAt: {
        type: Date,
        default: Date.now,
    },
});

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default Payment;
