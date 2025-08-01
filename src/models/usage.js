// /models/Usage.js
import mongoose from 'mongoose'

const UsageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['daily', 'weekly'],
        required: true
    },
    doubts: {
        type: Number,
        default: 0,
        min: 0
    },
    summaries: {
        type: Number,
        default: 0,
        min: 0
    },
    roadmaps: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true // This handles createdAt and updatedAt automatically
})

// Compound index for efficient queries
UsageSchema.index({ userId: 1, date: 1, type: 1 }, { unique: true })

const Usage = mongoose.models.Usage || mongoose.model('Usage', UsageSchema)

export default Usage