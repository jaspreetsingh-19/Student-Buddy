import connect from "@/lib/db"
import { NextResponse } from "next/server"
import PdfChat from "@/models/pdfChat"
import { getDataFromToken } from "@/helper/getDataFromToken"
import { GoogleGenerativeAI } from "@google/generative-ai"
import Log from "@/models/logs"

// ─── Increase serverless function timeout (Vercel) ───────────────────────────
export const maxDuration = 120

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)

// ─── GET: list all PDF sessions OR get a single session ──────────────────────
export async function GET(request) {
    try {
        await connect()
        const userId = await getDataFromToken(request)
        const { searchParams } = new URL(request.url)
        const sessionId = searchParams.get("sessionId")

        if (sessionId) {
            const session = await PdfChat.findOne({ _id: sessionId, userId })
            if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 })
            return NextResponse.json({ session })
        }

        // List view — don't send full extractedText or messages to keep it light
        const sessions = await PdfChat.find({ userId })
            .sort({ updatedAt: -1 })
            .select("-extractedText -contextSummary -messages")

        return NextResponse.json({ sessions })
    } catch (error) {
        console.error("GET /api/pdf-chat:", error)
        return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
    }
}

// ─── POST: two actions controlled by `action` field ─────────────────────────
//   action = "upload"  → receive base64 PDF + metadata, extract text, create session
//   action = "message" → send a user message, get AI reply, append both
export async function POST(request) {
    try {
        await connect()
        const userId = await getDataFromToken(request)
        const body = await request.json()
        const { action } = body

        // ── UPLOAD ─────────────────────────────────────────────────────────
        if (action === "upload") {
            const { base64, fileName, fileSize, title } = body

            if (!base64 || !fileName) {
                return NextResponse.json({ error: "base64 and fileName are required" }, { status: 400 })
            }

            const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"  })

            // ── Step 1: Extract text + welcome message in a SINGLE Gemini call ──
            let extractedText = ""
            let welcomeMsg = ""

            try {
                const extractResult = await model.generateContent([
                    {
                        inlineData: {
                            mimeType: "application/pdf",
                            data: base64,
                        },
                    },
                    {
                        text: `Perform two tasks on this PDF and return ONLY a valid JSON object with no markdown, no code fences, and no extra commentary.

Tasks:
1. Extract ALL the text content from this PDF, preserving paragraph structure with newlines.
2. Write a friendly 2-3 sentence welcome message that: confirms you've read the document, mentions 2-3 main topics covered, and invites the user to ask questions.

Return this exact JSON structure:
{
  "extractedText": "<full extracted text here>",
  "welcomeMessage": "<your 2-3 sentence welcome message here>"
}`,
                    },
                ])

                const raw = extractResult.response.text().trim()
                // Strip accidental markdown fences if model ignores instructions
                const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim()
                const parsed = JSON.parse(cleaned)
                extractedText = parsed.extractedText || ""
                welcomeMsg = parsed.welcomeMessage || ""
            } catch (parseError) {
                // Fallback: if JSON parsing fails, do two separate calls
                console.warn("Combined call failed, falling back to separate calls:", parseError.message)

                const extractOnly = await model.generateContent([
                    {
                        inlineData: { mimeType: "application/pdf", data: base64 },
                    },
                    {
                        text: `Extract ALL the text content from this PDF document. 
Return ONLY the raw extracted text, preserving paragraph structure with newlines.
Do not add any commentary, headers, or formatting — just the raw text content.`,
                    },
                ])
                extractedText = extractOnly.response.text().trim()

                const welcomeResult = await model.generateContent(
                    `You have access to a document titled "${title || fileName}". 
Here is the document content:

${extractedText.slice(0, 8000)}

Generate a brief, friendly 2-3 sentence welcome message that:
1. Confirms you've read the document
2. Mentions 2-3 main topics covered
3. Invites the user to ask questions

Keep it concise and conversational.`
                )
                welcomeMsg = welcomeResult.response.text().trim()
            }

            if (!extractedText || extractedText.length < 50) {
                return NextResponse.json(
                    { error: "Could not extract text from PDF. Make sure it's not a scanned image." },
                    { status: 400 }
                )
            }

            // ── Step 2: Generate a context summary for large docs ──────────────
            // This is used during chat so we don't blindly slice extractedText
            let contextSummary = ""
            try {
                const summaryResult = await model.generateContent(
                    `Summarize the key points, sections, and important details of the following document content in under 3000 words. 
This summary will be used as context for answering user questions, so be thorough and specific.

Document Title: ${title || fileName}

Document Content:
${extractedText.slice(0, 40000)}

Return only the summary text, no preamble.`
                )
                contextSummary = summaryResult.response.text().trim()
            } catch (summaryError) {
                // Non-fatal — fall back to sliced extractedText during chat
                console.warn("Summary generation failed:", summaryError.message)
                contextSummary = extractedText.slice(0, 12000)
            }

            const session = new PdfChat({
                userId,
                fileName,
                fileSize,
                extractedText,
                contextSummary,
                title: title || fileName.replace(".pdf", ""),
                messages: [{ role: "assistant", content: welcomeMsg }],
            })

            await session.save()

            try {
                await Log.create({ userId, action: "pdf_upload", topic: fileName })
            } catch {}

            return NextResponse.json({
                sessionId: session._id,
                session: { ...session.toObject(), extractedText: undefined, contextSummary: undefined },
                message: "PDF processed successfully",
            })
        }

        // ── MESSAGE ────────────────────────────────────────────────────────
        if (action === "message") {
            const { sessionId, userMessage } = body

            if (!sessionId || !userMessage) {
                return NextResponse.json({ error: "sessionId and userMessage are required" }, { status: 400 })
            }

            const session = await PdfChat.findOne({ _id: sessionId, userId })
            if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 })

            // Use contextSummary if available, otherwise fall back to sliced extractedText
            const documentContext = session.contextSummary
                ? session.contextSummary
                : session.extractedText.slice(0, 12000)

            // Build conversation history for context (last 10 messages)
            const historyText = session.messages
                .slice(-10)
                .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
                .join("\n\n")

            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"  })

            const prompt = `You are a helpful study assistant. You have access to the following document:

--- DOCUMENT CONTEXT START ---
${documentContext}
--- DOCUMENT CONTEXT END ---

Previous conversation:
${historyText}

User: ${userMessage}

Answer the user's question based on the document content. 
- Be specific and reference the document directly when relevant
- If the answer isn't in the document, say so clearly
- Keep responses concise but thorough
- Use bullet points for lists when helpful`

            const result = await model.generateContent(prompt)
            const assistantReply = result.response.text().trim()

            // Append both messages
            session.messages.push({ role: "user", content: userMessage })
            session.messages.push({ role: "assistant", content: assistantReply })
            await session.save()

            return NextResponse.json({ reply: assistantReply })
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    } catch (error) {
        console.error("POST /api/pdf-chat:", error)
        return NextResponse.json({ error: "Request failed" }, { status: 500 })
    }
}

// ─── DELETE: remove a session ─────────────────────────────────────────────────
export async function DELETE(request) {
    try {
        await connect()
        const userId = await getDataFromToken(request)
        const { searchParams } = new URL(request.url)
        const sessionId = searchParams.get("sessionId")

        await PdfChat.findOneAndDelete({ _id: sessionId, userId })
        return NextResponse.json({ message: "Session deleted" })
    } catch (error) {
        console.error("DELETE /api/pdf-chat:", error)
        return NextResponse.json({ error: "Failed to delete session" }, { status: 500 })
    }
}