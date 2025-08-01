import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    questionType: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'short-answer'],
        default: 'multiple-choice'
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuizQuestion'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
export default Quiz;