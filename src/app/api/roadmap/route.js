import connect from "@/lib/db";
import { NextResponse } from "next/server";
import Roadmap from "@/models/roadmap";
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getDataFromToken } from "@/helper/getDataFromToken"
import Log from "@/models/logs"


connect();


export async function POST(request) {
    try {
        const userId = await getDataFromToken(request)
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { title, duration, goal } = await request.json();
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        const prompt = `Create a ${duration} learning roadmap titled "${title}" to achieve: ${goal}. 

Structure it clearly **week by week** using clean formatting — **no Markdown symbols** like ###, ***, etc.

Follow this style:

Week 1 - [Week Title]
🔹 Goals:
- ...
🔹 Topics:
- ...
🔹 Tasks:
- ...
🔹 Milestones:
- ...
🔹 Try On Your Own Challenges:
- ...

Use clean bullets (• or -), numbers (1., 2.), and section labels (🔹) for clarity.
Avoid long paragraphs — keep content skimmable and readable.
Use spacing between weeks. Make it clean, elegant, and professional.
Do not add random symbols or Markdown styling. Keep it like a polished PDF or document.
If the message is not about creating a roadmap or is unrelated to roadmap, respond with:
"I'm sorry, I can only help with creating roadmaps."
`
        const result = await model.generateContent(prompt)
        const generated = await result.response.text()

        const roadmap = await Roadmap.create({
            userId,
            title,
            duration,
            goal,
            generated,
        })
        await Log.create({
            userId,
            action: "Created Roadmap",
            details: `Title: ${title.slice(0, 50)}...`,
            feature: "roadmap",
            timestamp: new Date(),
        });

        return NextResponse.json({ roadmap })
    } catch (error) {
        console.error("❌ Backend Error in POST /api/roadmap:", error);
        return NextResponse.json(
            { error: "Failed to create roadmap", detail: error.message },
            { status: 500 }
        );

    }
}


export async function GET(request) {
    try {
        const userId = await getDataFromToken(request)
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


        const roadmaps = await Roadmap.find({ userId }).sort({ createdAt: -1 });

        return NextResponse.json({ roadmaps });
    } catch (error) {

        console.error("❌ Backend Error in GET /api/roadmap:", error);
        return NextResponse.json(
            { error: "Failed to fetch roadmaps", detail: error.message },
            { status: 500 }
        );

    }

}