
import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },


    conversationId: { type: String, required: true }, // group related messages


    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },


    topic: { type: String },
    conversationTitle: { type: String },
    isFirstMessage: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
});


const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

export default Message;