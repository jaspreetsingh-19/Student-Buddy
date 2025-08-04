import mongoose from "mongoose";


const logSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: String,
    details: String,
    feature: {
        type: String,
        enum: ["summarizer", "roadmap", "task", "chatbot", "quiz", "Explore Resources"],
        required: true,
    },

    timestamp: { type: Date, default: Date.now },
});

const Log = mongoose.models.Log || mongoose.model("Log", logSchema);

export default Log;