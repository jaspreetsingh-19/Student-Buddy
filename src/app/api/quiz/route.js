import connect from "@/lib/db"
import { NextResponse } from "next/server"
import Question from "@/models/quizQuestion"
import Quiz from "@/models/quiz"
import { getDataFromToken } from "@/helper/getDataFromToken"
import { GoogleGenerativeAI } from "@google/generative-ai"
import Log from "@/models/logs"


connect();

export async function GET(request) {
    const userId = await getDataFromToken(request)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // Get all quizzes for user with their questions
        const quizzes = await Quiz.find({ userId }).sort({ createdAt: -1 }).populate('questions');
        return NextResponse.json({ quizzes });

    } catch (error) {
        console.log("error in /api/quiz GET: ", error)
        return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
    }
}

export async function POST(request) {
    const userId = await getDataFromToken(request)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { topic, difficulty, questionType, questionNumbers } = await request.json()


        // Generate AI content
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        const prompt = `Generate ${questionNumbers} ${difficulty} level quiz questions about ${topic}. 
        The question type should be ${questionType || 'multiple-choice'}.

        For multiple-choice questions, provide 4 options with only one correct answer.
        For true-false questions, provide true/false options.
        For short-answer questions, provide the correct answer and explanation.

        Return the response in this exact JSON format:
        {
            "questions": [
                {
                    "questionText": "Your question here",
                    "questionType": "${questionType || 'multiple-choice'}",
                    "options": [
                        {"text": "Option 1", "isCorrect": false},
                        {"text": "Option 2", "isCorrect": true},
                        {"text": "Option 3", "isCorrect": false},
                        {"text": "Option 4", "isCorrect": false}
                    ],
                    "explanation": "Brief explanation of the correct answer"
                }
            ]
        }

        Make sure the questions are relevant to ${topic} and appropriate for ${difficulty} difficulty level.`

        const result = await model.generateContent(prompt)
        const generated = await result.response.text()
        let parsedQuestions;
        try {
            // Clean the response text (remove markdown code blocks if present)
            const cleanedResponse = generated.replace(/```json\n?|\n?```/g, '').trim();
            parsedQuestions = JSON.parse(cleanedResponse);
        } catch (parseError) {
            console.log("Failed to parse AI response:", generated);
            return NextResponse.json({ error: "Failed to generate valid quiz questions" }, { status: 500 });
        }

        const quiz = new Quiz({
            userId,
            title: `${topic} Quiz - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`,
            topic,
            difficulty,
            questionType: questionType || 'multiple-choice',
            totalQuestions: questionNumbers,
            questions: []
        });

        const savedQuiz = await quiz.save();

        const questionIds = [];
        for (const questionData of parsedQuestions.questions) {
            const question = new Question({
                quizId: savedQuiz._id,
                questionText: questionData.questionText,
                questionType: questionData.questionType,
                options: questionData.options,
                explanation: questionData.explanation,
                difficulty,
                topic,
                userId
            });

            const savedQuestion = await question.save();
            questionIds.push(savedQuestion._id);
        }

        savedQuiz.questions = questionIds;
        await savedQuiz.save();

        const log = new Log({
            userId,
            action: 'QUIZ_GENERATED',
            details: `${topic, difficulty, questionNumbers}`,
            timestamp: new Date(),
            feature: "quiz"
        });
        await log.save();

        const completeQuiz = await Quiz.findById(savedQuiz._id).populate('questions');

        return NextResponse.json({
            message: 'Quiz generated successfully',
            quiz: completeQuiz
        });

    } catch (error) {
        console.log("error in /api/quiz POST: ", error)
        return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
    }
}

export async function DELETE(request) {
    const userId = await getDataFromToken(request)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { searchParams } = new URL(request.url);
        const quizId = searchParams.get('quizId');

        if (!quizId) {
            return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 });
        }


        const quiz = await Quiz.findOne({ _id: quizId, userId });
        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found or unauthorized" }, { status: 404 });
        }


        await Question.deleteMany({ quizId });


        await Quiz.findByIdAndDelete(quizId);


        return NextResponse.json({ message: 'Quiz deleted successfully' });

    } catch (error) {
        console.log("error in /api/quiz DELETE: ", error)
        return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 });
    }
}