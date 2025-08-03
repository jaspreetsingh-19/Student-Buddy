import connect from "@/lib/db"
import { NextResponse } from "next/server"
import Summary from "@/models/summarizer"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getDataFromToken } from "@/helper/getDataFromToken"
import Log from "@/models/logs"
import Usage from "@/models/usage"
import { checkPremiumAccess } from "@/lib/checkPremium";
import User from "@/models/user";


connect()
async function trackUsage(userId, feature) {
    const user = await User.findById(userId);
    const isPremium = user.isPremium && new Date(user.premiumExpires) > new Date();
    if (isPremium) return { allowed: true, message: "Premium user" };

    const limits = {
        summaries: 2,
        doubts: 3,
        roadmaps: 1,
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usageType = feature === "roadmaps" ? "weekly" : "daily";
    const dateToUse = usageType === "weekly"
        ? new Date(today.setDate(today.getDate() - today.getDay())) // start of week
        : today;

    let usage = await Usage.findOne({ userId, date: dateToUse, type: usageType });

    if (!usage) {
        usage = new Usage({ userId, date: dateToUse, type: usageType });
    }

    const current = usage[feature] || 0;
    if (current >= limits[feature]) {
        return {
            allowed: false,
            message: `Free usage limit exceeded for ${feature}`,
        };
    }

    usage[feature] = current + 1;
    await usage.save();

    return { allowed: true, message: "Usage recorded" };
}

export async function POST(request) {
    try {
        const userId = await getDataFromToken(request)
        const { input } = await request.json()
        if (!input) return NextResponse.json({ error: "Input is required" }, { status: 400 })

        console.log("Processing text input, length:", input.length)

        if (!input || input.trim().length === 0) {
            console.error("No content available for summarization")
            return NextResponse.json(
                {
                    error: "No content available to summarize. Please provide some text.",
                },
                { status: 400 },
            )
        }

        if (input.trim().length < 50) {
            return NextResponse.json(
                {
                    error: "Text is too short. Please provide at least 50 characters for a meaningful summary.",
                },
                { status: 400 },
            )
        }

        console.log("Content length for summarization:", input.length)
        const usageStatus = await trackUsage(userId, "summaries");

        if (!usageStatus.allowed) {
            return NextResponse.json({ error: usageStatus.message }, { status: 403 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

        const prompt = `
You are a highly intelligent and versatile summarizer with expert-level understanding across all subjects and domains.

Your task is to carefully read and understand the content below, then distill it into **clear, concise, high-impact bullet points**.

Content:
"""
${input}
"""

Your Summary Must:
• Capture the **core ideas**, **insights**, and **critical information** from the content and explain in brief.
• Be domain-aware — adapt based on whether the topic is technical, academic, business, creative, medical, legal, scientific, etc.
• Use **simple, natural, human-friendly language** — even for complex topics.
• Extract and rephrase the **most important points**, not just obvious facts or surface-level details.
• Maintain the **intent, tone, and context** of the original content without copying text verbatim.
• Remove all filler, repetition, and irrelevant details — focus on **value per line**.
• Present only **the key takeaways, conclusions, or recommendations**, as applicable.
• If the content is structured (e.g., multiple sections or speakers), reflect that structure briefly in the summary.

Formatting Rules:
• Bullet points only — no headings, paragraphs, or extra explanation.
• Each bullet point must be self-contained, clear, and insightful.
• Do not include any introduction, disclaimer, or closing remarks.

Output Format:
• Key point 1  
• Key point 2  
• Key point 3  
...
`;


        console.log("Sending to Gemini for summarization...")
        const result = await model.generateContent(prompt)
        const summary = result.response.text()

        console.log("Summary generated successfully, length:", summary.length)

        const savedSummary = await Summary.create({
            userId,
            originalInput: input,
            summary,

        })
        await Log.create({
            userId,
            action: "Summarized Content",
            details: `Input: ${input.slice(0, 50)}...`,
            feature: "summarizer",
            timestamp: new Date(),
        });

        console.log("Summary saved to database with ID:", savedSummary._id)

        return NextResponse.json(
            {
                summary,
                id: savedSummary._id,

            },
            { status: 200 },
        )
    } catch (error) {
        console.error("Error creating summary:", error)

        if (error.message?.includes("API key")) {
            return NextResponse.json({ error: "AI service configuration error" }, { status: 500 })
        } else if (error.message?.includes("quota")) {
            return NextResponse.json({ error: "AI service quota exceeded" }, { status: 429 })
        }

        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function GET(request) {
    try {
        const userId = await getDataFromToken(request)
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const summaries = await Summary.find({ userId }).sort({ createdAt: -1 })
        return NextResponse.json(summaries, { status: 200 })
    } catch (error) {
        console.error("Error fetching summaries:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}


