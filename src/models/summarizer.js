import mongoose from "mongoose"

const SummarySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    originalInput: { type: String, },
    summary: { type: String },
    createdAt: { type: Date, default: Date.now },

})

const Summary = mongoose.models.Summary || mongoose.model("Summary", SummarySchema);
export default Summary;