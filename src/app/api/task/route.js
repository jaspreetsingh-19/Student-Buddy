import connect from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import Task from "@/models/task"
import { getDataFromToken } from "@/helper/getDataFromToken"
import Log from "@/models/logs"


connect()

export async function GET(request) {
    try {
        const userId = await getDataFromToken(request)
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const tasks = await Task.find({ userId }).sort({ date: 1 })

        return NextResponse.json({ tasks })

    } catch (error) {
        console.log("errro in /api/task/get", error)
        return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const userId = await getDataFromToken(request)
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json()
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
            feature: "task",
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

