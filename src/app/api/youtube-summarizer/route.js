import connect from "@/lib/db"
import { NextResponse } from "next/server"
import YoutubeSummary from "@/models/youtubeSummary"
import { getDataFromToken } from "@/helper/getDataFromToken"
import { GoogleGenerativeAI } from "@google/generative-ai"
import Log from "@/models/logs"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)

// Extract YouTube video ID from various URL formats
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/,
    ]
    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) return match[1]
    }
    return null
}

// Fetch video metadata from YouTube oEmbed API (no API key needed)
async function fetchVideoMetadata(videoId) {
    try {
        const res = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
        )
        if (!res.ok) return null
        const data = await res.json()
        return {
            videoTitle: data.title,
            channelName: data.author_name,
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        }
    } catch {
        return null
    }
}

// Fetch transcript using youtube-transcript or youtubetranscript.com
async function fetchTranscript(videoId) {
    // Try youtubetranscript.com free API first
    try {
        const res = await fetch(
            `https://yt.lemnoslife.com/noKey/captions?videoId=${videoId}&lang=en`,
            { signal: AbortSignal.timeout(8000) }
        )
        if (res.ok) {
            const data = await res.json()
            if (data?.captions?.length) {
                return data.captions.map(c => c.text).join(" ")
            }
        }
    } catch {}

    // Fallback: use Gemini to summarize from video URL directly
    return null
}

// ─── GET: list all summaries OR get a single one ─────────────────────────────
export async function GET(request) {
    try {
        await connect()
        const userId = await getDataFromToken(request)
        const { searchParams } = new URL(request.url)
        const summaryId = searchParams.get("summaryId")

        if (summaryId) {
            const summary = await YoutubeSummary.findOne({ _id: summaryId, userId })
            if (!summary) return NextResponse.json({ error: "Summary not found" }, { status: 404 })
            return NextResponse.json({ summary })
        }

        const summaries = await YoutubeSummary.find({ userId })
            .sort({ createdAt: -1 })
            .select("-transcript -summary.detailedSections")

        return NextResponse.json({ summaries })
    } catch (error) {
        console.error("GET /api/youtube-summarizer:", error)
        return NextResponse.json({ error: "Failed to fetch summaries" }, { status: 500 })
    }
}

// ─── POST: summarize a YouTube video ─────────────────────────────────────────
export async function POST(request) {
    try {
        await connect()
        const userId = await getDataFromToken(request)
        const { videoUrl, summaryDepth = "detailed" } = await request.json()

        if (!videoUrl) {
            return NextResponse.json({ error: "videoUrl is required" }, { status: 400 })
        }

        const videoId = extractVideoId(videoUrl)
        if (!videoId) {
            return NextResponse.json({ error: "Invalid YouTube URL. Please use a standard youtube.com or youtu.be link." }, { status: 400 })
        }

        // Check if already summarized for this user
        const existing = await YoutubeSummary.findOne({ userId, videoId })
        if (existing) {
            return NextResponse.json({ summary: existing, cached: true })
        }

        // Fetch metadata
        const metadata = await fetchVideoMetadata(videoId)

        // Try to get transcript
        const transcript = await fetchTranscript(videoId)

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        let prompt
        if (transcript) {
            prompt = `You are an expert educational content summarizer. Analyze this YouTube video transcript and create a comprehensive study summary.

Video Title: "${metadata?.videoTitle || "Unknown"}"
Channel: "${metadata?.channelName || "Unknown"}"

Full Transcript:
${transcript.slice(0, 15000)}

Create a thorough educational summary. Return ONLY valid JSON (no markdown, no extra text):
{
  "overview": "<2-3 sentence TL;DR of the entire video>",
  "keyPoints": ["<key point 1>", "<key point 2>", "<key point 3>", "<key point 4>", "<key point 5>"],
  "detailedSections": [
    {
      "title": "<section title>",
      "content": "<2-3 sentence summary of this section>",
      "timestamp": "<estimated timestamp range like '0:00 - 5:30'>"
    }
  ],
  "importantTerms": [
    { "term": "<term>", "definition": "<clear definition>" }
  ],
  "takeaways": ["<actionable takeaway 1>", "<actionable takeaway 2>", "<actionable takeaway 3>"],
  "studyQuestions": ["<study question 1>", "<study question 2>", "<study question 3>", "<study question 4>"]
}`
        } else {
            // No transcript — use Gemini's knowledge about the video from URL
            prompt = `You are an expert educational content summarizer.

A student wants to study from this YouTube video:
URL: ${videoUrl}
Video ID: ${videoId}
${metadata ? `Title: "${metadata.videoTitle}"\nChannel: "${metadata.channelName}"` : ""}

Note: The transcript is unavailable. Based on the video title, channel, and your knowledge, generate the most helpful educational summary you can. Be clear if you're working from limited information.

Return ONLY valid JSON (no markdown, no extra text):
{
  "overview": "<2-3 sentence overview of what this video likely covers>",
  "keyPoints": ["<key point 1>", "<key point 2>", "<key point 3>", "<key point 4>", "<key point 5>"],
  "detailedSections": [
    {
      "title": "<likely section title>",
      "content": "<summary of this section>",
      "timestamp": "<estimated timestamp>"
    }
  ],
  "importantTerms": [
    { "term": "<term>", "definition": "<definition>" }
  ],
  "takeaways": ["<takeaway 1>", "<takeaway 2>", "<takeaway 3>"],
  "studyQuestions": ["<question 1>", "<question 2>", "<question 3>", "<question 4>"]
}`
        }

        const result = await model.generateContent(prompt)
        const responseText = result.response.text().trim()

        let summaryData
        try {
            const cleaned = responseText.replace(/```json|```/g, "").trim()
            summaryData = JSON.parse(cleaned)
        } catch {
            return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
        }

        const summaryDoc = new YoutubeSummary({
            userId,
            videoUrl,
            videoId,
            videoTitle: metadata?.videoTitle || "YouTube Video",
            channelName: metadata?.channelName || "Unknown Channel",
            thumbnailUrl: metadata?.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            transcript: transcript || "",
            summary: summaryData,
        })

        await summaryDoc.save()

        try { await Log.create({ userId, action: "youtube_summarize", topic: metadata?.videoTitle || videoId }) } catch {}

        return NextResponse.json({ summary: summaryDoc })
    } catch (error) {
        console.error("POST /api/youtube-summarizer:", error)
        return NextResponse.json({ error: "Failed to summarize video" }, { status: 500 })
    }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE(request) {
    try {
        await connect()
        const userId = await getDataFromToken(request)
        const { searchParams } = new URL(request.url)
        const summaryId = searchParams.get("summaryId")

        await YoutubeSummary.findOneAndDelete({ _id: summaryId, userId })
        return NextResponse.json({ message: "Summary deleted" })
    } catch (error) {
        console.error("DELETE /api/youtube-summarizer:", error)
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
    }
}