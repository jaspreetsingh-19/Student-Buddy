import connect from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import ExploreResource from "@/models/resources"
import { getDataFromToken } from "@/helper/getDataFromToken"
import { GoogleGenerativeAI } from "@google/generative-ai"
import Log from "@/models/logs"
import { checkPremiumAccess } from "@/lib/checkPremium";


connect()

export async function GET(request) {
    try {
        const userId = await getDataFromToken(request)
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const resources = await ExploreResource.find({ userId }).sort({ createdAt: 1 })

        return NextResponse.json({ resources })

    } catch (error) {
        console.log("error in /resources/get", error)
        return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const userId = await getDataFromToken(request)
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { topic } = await request.json();
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        const prompt = `You are an expert learning resource curator. Provide comprehensive learning resources for the topic: ${topic}

IMPORTANT GUIDELINES FOR LINKS:
- ONLY provide links from these trusted domains: official documentation sites, github.com, youtube.com, coursera.org, edx.org, udemy.com, freecodecamp.org, mozilla.org, w3schools.com, stackoverflow.com, medium.com, dev.to
- For official documentation, use the main domain (e.g., https://reactjs.org for React, https://nodejs.org for Node.js)
- For YouTube, use general channel recommendations rather than specific video URLs
- If you're unsure about a specific URL, provide the general website domain instead
- DO NOT create or guess specific URLs

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

1. Overview:
[Provide a clear 2-3 sentence explanation of what ${topic} is and why it's important]

2. Resources:

Links:
1. Official Documentation: [main official website if it exists]
2. GitHub Repository: [if there's a main official repo]
3. Community Hub: [main community site if applicable]
4. Tutorial Site: [reliable tutorial sites like freecodecamp.org or w3schools.com]
...
Books:
1. [Book Title] by [Author] - [One line about why it's good]
2. [Book Title] by [Author] - [One line about why it's good]
...

YouTube Channels/Videos:
1. [Channel Name] - [Brief description of what they cover]
2. [Channel Name] - [Brief description of what they cover]
...

Courses:
1. [Course Title] on [Platform] (Free/Paid) - [Brief description]
2. [Course Title] on [Platform] (Free/Paid) - [Brief description]
...

3. Bonus Tips:
1. Prerequisites: [What should be learned first]
2. Learning Path: [Suggested order of learning]
3. Practice Projects: [Types of projects to build]
4. Stay Updated: [How to keep current with the topic]
...
FORMATTING RULES:
- Use simple bullet points (-)
- Write full URLs like https://example.com
- No markdown formatting (**bold**, ##headers, etc.)
- Keep descriptions concise and practical
- Focus on quality over quantity (3-5 items per section is perfect)`

        const result = await model.generateContent(prompt)
        const generated = await result.response.text()

        const resource = await ExploreResource.create({
            userId,
            topic,
            resources: generated,
        })
        await Log.create({
            userId,
            action: "Asked for Resources",
            details: `Topics: ${topic.slice(0, 50)}...`,
            feature: "Explore Resources",
            timestamp: new Date(),
        });
        return NextResponse.json({ resource })
    } catch (error) {
        console.error("❌ Backend Error in POST /api/resources:", error)
        return NextResponse.json(
            { error: "Failed to create resource", detail: error.message },
            { status: 500 }
        )
    }

}

