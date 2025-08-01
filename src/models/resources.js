

import mongoose from "mongoose"

const ExploreResourceSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        topic: { type: String },
        resources: { type: String },
    },
    { timestamps: true }
)

const ExploreResource = mongoose.models.ExploreResource || mongoose.model("ExploreResource", ExploreResourceSchema)

export default ExploreResource
