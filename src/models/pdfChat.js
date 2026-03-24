import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
})

const pdfChatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    fileName: { type: String, required: true },
    fileSize: { type: Number },                         // bytes
    pageCount: { type: Number, default: 0 },
    extractedText: { type: String, required: true },    // full PDF text stored for context
    contextSummary: { type: String, default: "" },      // condensed summary used during chat for large PDFs
    title: { type: String, required: true },            // user-facing name
    messages: [messageSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})

pdfChatSchema.pre("save", function (next) {
    this.updatedAt = Date.now()
    next()
})

const PdfChat = mongoose.models.PdfChat || mongoose.model("PdfChat", pdfChatSchema)
export default PdfChat