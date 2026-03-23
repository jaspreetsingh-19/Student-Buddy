import mongoose from "mongoose"

const essaySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    essayText: {
        type: String,
        required: true,
    },
    essayType: {
        type: String,
        enum: ["academic", "creative", "argumentative", "narrative", "descriptive", "expository"],
        default: "academic",
    },
    wordCount: { type: Number, default: 0 },
    feedback: {
        overallScore: { type: Number, min: 0, max: 100 },
        grade: { type: String },   // A+, A, B+, etc.
        summary: { type: String },
        scores: {
            structure: { type: Number, min: 0, max: 10 },
            grammar: { type: Number, min: 0, max: 10 },
            argumentStrength: { type: Number, min: 0, max: 10 },
            clarity: { type: Number, min: 0, max: 10 },
            vocabulary: { type: Number, min: 0, max: 10 },
            creativity: { type: Number, min: 0, max: 10 },
        },
        strengths: [{ type: String }],
        improvements: [{ type: String }],
        detailedFeedback: {
            structure: { type: String },
            grammar: { type: String },
            argumentStrength: { type: String },
            clarity: { type: String },
            vocabulary: { type: String },
        },
        suggestions: [{ type: String }],
    },
    createdAt: { type: Date, default: Date.now },
})

const Essay = mongoose.models.Essay || mongoose.model("Essay", essaySchema)
export default Essay