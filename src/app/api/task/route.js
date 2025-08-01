import connect from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import Task from "@/models/task"
import { getDataFromToken } from "@/helper/getDataFromToken"
import Log from "@/models/logs"
import { checkPremiumAccess } from "@/lib/checkPremium";

connect()

export async function GET(req) {
    try {
        const userId = await getDataFromToken(request)
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const tasks = await Task.find({ userId }).sort({ date: 1 })

        return NextResponse.json({ tasks })

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        const userId = await getDataFromToken(request)
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json()
        const { title, description, date, priority, dueTime, category } = body

        const task = await Task.create({
            userId,
            title,
            description,
            date: new Date(date),
            priority: priority || "medium",
            dueTime,
            category,
        })
        await Log.create({
            userId,
            action: "Created Task",
            details: `Title: ${title.slice(0, 50)}...`,
            feature: "Task Management",
            timestamp: new Date(),
        });

        return NextResponse.json({ message: "Task created", task })
    } catch (error) {
        console.error("❌ Backend Error in POST /api/task:", error)
        return NextResponse.json(
            { error: "Failed to create task", detail: error.message },
            { status: 500 }
        )
    }
}

