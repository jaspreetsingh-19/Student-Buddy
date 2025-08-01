import connect from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import Task from "@/models/task"
import { getDataFromToken } from "@/helper/getDataFromToken"
import Log from "@/models/logs"

connect()

export async function GET(req, { params }) {
    try {
        const userId = await getDataFromToken(request)
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const task = await Task.findOne({ _id: params.id, userId })
        if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 })

        return NextResponse.json({ task })
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 })
    }
}

export async function PATCH(req, { params }) {
    try {
        const userId = await getDataFromToken(request)
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const body = await req.json()

        const updatedTask = await Task.findOneAndUpdate({ _id: params.id, userId }, { $set: body }, { new: true })

        if (!updatedTask) return NextResponse.json({ error: "Task not found" }, { status: 404 })
        await Log.create({
            userId,
            action: "Updated Task",
            details: `Title: ${updatedTask.title.slice(0, 50)}...`,
            feature: "Task Management",
            timestamp: new Date(),
        });

        return NextResponse.json({ message: "Task updated", task: updatedTask })
    } catch (error) {
        return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
    }
}

export async function DELETE(req, { params }) {
    try {
        const userId = await getDataFromToken(request)
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const deletedTask = await Task.findOneAndDelete({ _id: params.id, userId })
        if (!deletedTask) return NextResponse.json({ error: "Task not found" }, { status: 404 })

        return NextResponse.json({ message: "Task deleted" })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
    }
}
