import mongoose from "mongoose"

const flashcardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    deckName: {
        type: String,
        required: true,
        trim: true,
    },
    topic: {
        type: String,
        required: true,
        trim: true,
    },
    cards: [
        {
            front: { type: String, required: true },
            back: { type: String, required: true },
            // Spaced repetition fields
            status: {
                type: String,
                enum: ["new", "learning", "review", "mastered"],
                default: "new",
            },
            easeFactor: { type: Number, default: 2.5 },   // SM-2 ease factor
            interval: { type: Number, default: 1 },        // days until next review
            repetitions: { type: Number, default: 0 },
            nextReviewDate: { type: Date, default: Date.now },
            lastReviewDate: { type: Date, default: null },
        },
    ],
    totalCards: { type: Number, default: 0 },
    masteredCards: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})

flashcardSchema.pre("save", function (next) {
    this.updatedAt = Date.now()
    this.totalCards = this.cards.length
    this.masteredCards = this.cards.filter((c) => c.status === "mastered").length
    next()
})

const Flashcard = mongoose.models.Flashcard || mongoose.model("Flashcard", flashcardSchema)
export default Flashcard