import connect from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

import Quiz from "@/models/quiz"
import Message from "@/models/message"
import ExploreResource from "@/models/resources"
import Roadmap from "@/models/roadmap"
import Summary from "@/models/summarizer"
import Task from "@/models/task"
import User from "@/models/user"

import { getDataFromToken } from "@/helper/getDataFromToken"

connect();


export async function GET(request) {
    const userId = await getDataFromToken(request)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.log("user id", userId)

    try {

        const remainingTask = await Task.find({ userId, isCompleted: false });
        console.log("task are", remainingTask)
        return NextResponse.json({ remainingTask });

    } catch (error) {
        console.log("error in /dashboard/get", error)
        return NextResponse.json({ error: "Failed to fetch dashboard request" }, { status: 500 });
    }
}
