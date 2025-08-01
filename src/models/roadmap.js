import mongoose from "mongoose"

const RoadmapSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    duration: { type: String },
    goal: { type: String },
    generated: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
})

const Roadmap = mongoose.models.Roadmap || mongoose.model("Roadmap", RoadmapSchema);

export default Roadmap