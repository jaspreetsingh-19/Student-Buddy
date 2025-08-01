import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    questionText: {
        type: String,
        required: true
    },
    questionType: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'short-answer'],
        default: 'multiple-choice'
    },
    options: [
        {
            text: { type: String, required: true },
            isCorrect: { type: Boolean, required: true }
        }
    ],
    explanation: {
        type: String,
        default: ''
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Question = mongoose.models.QuizQuestion || mongoose.model('QuizQuestion', quizQuestionSchema);
export default Question;