import mongoose from "mongoose"

const youtubeSummarySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    videoUrl: { type: String, required: true },
    videoId: { type: String, required: true },
    videoTitle: { type: String },
    channelName: { type: String },
    thumbnailUrl: { type: String },
    duration: { type: String },
    transcript: { type: String },          // raw transcript text
    summary: {
        overview: { type: String },        // 2–3 sentence TL;DR
        keyPoints: [{ type: String }],     // bullet points
        detailedSections: [
            {
                title: { type: String },
                content: { type: String },
                timestamp: { type: String },   // e.g. "0:00 - 3:45"
            },
        ],
        importantTerms: [
            {
                term: { type: String },
                definition: { type: String },
            },
        ],
        takeaways: [{ type: String }],
        studyQuestions: [{ type: String }],
    },
    createdAt: { type: Date, default: Date.now },
})

const YoutubeSummary =
    mongoose.models.YoutubeSummary || mongoose.model("YoutubeSummary", youtubeSummarySchema)
export default YoutubeSummary