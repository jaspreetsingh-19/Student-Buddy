import connect from "@/lib/db"
import { NextResponse } from "next/server"
import Essay from "@/models/Essay"
import { getDataFromToken } from "@/helper/getDataFromToken"
import { GoogleGenerativeAI } from "@google/generative-ai"
import Log from "@/models/logs"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)

// GET - fetch all essays for user
export async function GET(request) {
    try {
        await connect()
        const userId = await getDataFromToken(request)
        const { searchParams } = new URL(request.url)
        const essayId = searchParams.get("essayId")

        if (essayId) {
            const essay = await Essay.findOne({ _id: essayId, userId })
            if (!essay) return NextResponse.json({ error: "Essay not found" }, { status: 404 })
            return NextResponse.json({ essay })
        }

        const essays = await Essay.find({ userId })
            .sort({ createdAt: -1 })
            .select("-essayText") // don't send full text in list view
        return NextResponse.json({ essays })
    } catch (error) {
        console.error("GET /api/essay-grader error:", error)
        return NextResponse.json({ error: "Failed to fetch essays" }, { status: 500 })
    }
}

// POST - grade an essay
export async function POST(request) {
    try {
        await connect()
        const userId = await getDataFromToken(request)
        const { essayText, title, essayType = "academic" } = await request.json()

        if (!essayText || !title) {
            return NextResponse.json({ error: "Essay text and title are required" }, { status: 400 })
        }

        const wordCount = essayText.trim().split(/\s+/).length

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const prompt = `You are an expert academic grader and writing coach. Grade the following ${essayType} essay thoroughly and constructively.

Essay Title: "${title}"
Essay Type: ${essayType}
Word Count: ${wordCount}

Essay:
${essayText}

Provide a detailed, fair, and encouraging assessment. Return ONLY valid JSON (no markdown, no extra text):
{
  "overallScore": <number 0-100>,
  "grade": "<letter grade: A+/A/A-/B+/B/B-/C+/C/C-/D/F>",
  "summary": "<2-3 sentence overall assessment>",
  "scores": {
    "structure": <0-10>,
    "grammar": <0-10>,
    "argumentStrength": <0-10>,
    "clarity": <0-10>,
    "vocabulary": <0-10>,
    "creativity": <0-10>
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "detailedFeedback": {
    "structure": "<detailed feedback on essay structure and organization>",
    "grammar": "<detailed feedback on grammar, punctuation, spelling>",
    "argumentStrength": "<detailed feedback on thesis, evidence, logic>",
    "clarity": "<detailed feedback on clarity and coherence>",
    "vocabulary": "<detailed feedback on word choice and language use>"
  },
  "suggestions": ["<specific actionable suggestion 1>", "<specific actionable suggestion 2>", "<specific actionable suggestion 3>"]

  Return ONLY valid JSON.
Do NOT include markdown, backticks, or explanations.
Ensure the JSON is strictly valid and parsable.
}`


        const result = await model.generateContent(prompt)
        const responseText = result.response.text().trim()

        let feedback;

try {
    const cleaned = responseText
        .replace(/```json|```/g, "")
        .trim();

    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("No JSON found in response");
    }

    const jsonString = cleaned.slice(jsonStart, jsonEnd + 1);

    feedback = JSON.parse(jsonString);

} catch (err) {
    console.error("RAW AI RESPONSE:", responseText);

    return NextResponse.json(
        { error: "AI returned invalid format" },
        { status: 500 }
    );
}
        const essay = new Essay({
            userId,
            title,
            essayText,
            essayType,
            wordCount,
            feedback,
        })

        await essay.save()

        try {
            await Log.create({ userId, action: "essay_grade", topic: title })
        } catch {}

        return NextResponse.json({ essay, message: "Essay graded successfully" })
    } catch (error) {
        console.error("POST /api/essay-grader error:", error)
        return NextResponse.json({ error: "Failed to grade essay" }, { status: 500 })
    }
}

// DELETE - remove an essay
export async function DELETE(request) {
    try {
        await connect()
        const userId = await getDataFromToken(request)
        const { searchParams } = new URL(request.url)
        const essayId = searchParams.get("essayId")

        await Essay.findOneAndDelete({ _id: essayId, userId })
        return NextResponse.json({ message: "Essay deleted" })
    } catch (error) {
        console.error("DELETE /api/essay-grader error:", error)
        return NextResponse.json({ error: "Failed to delete essay" }, { status: 500 })
    }
}