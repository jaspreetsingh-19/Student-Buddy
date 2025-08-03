import connect from "@/lib/db"
import { NextResponse } from "next/server"
import Message from "@/models/message"
import { getAIResponse } from "@/lib/aiForChatbot"
import { getDataFromToken } from "@/helper/getDataFromToken"
import { checkPremiumAccess } from "@/lib/checkPremium";

import Log from "@/models/logs"


connect()

export async function GET(req) {
    try {
        const userId = await getDataFromToken(req)
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


        const { searchParams } = new URL(req.url)
        const conversationId = searchParams.get("conversationId")

        if (!conversationId) {
            return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 })
        }

        const messages = await Message.find({ userId, conversationId }).sort({ timestamp: 1 })
        return NextResponse.json({ messages })
    } catch (error) {
        console.error("Error fetching messages:", error)
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        const userId = await getDataFromToken(req)
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url)
        const conversationId = searchParams.get("conversationId")

        if (!conversationId) {
            return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 })
        }

        const { message, conversationTitle } = await req.json()

        const recentMessages = await Message.find({ userId, conversationId })
            .sort({ timestamp: -1 })
            .limit(10)
            .sort({ timestamp: 1 })

        const userMessage = await Message.create({
            userId,
            conversationId,
            role: "user",
            content: message,
            conversationTitle,
            isFirstMessage: false,
            timestamp: new Date(),
        })

        const aiResponse = await getAIResponse(message, recentMessages)

        const assistantMessage = await Message.create({
            userId,
            conversationId,
            role: "assistant",
            content: aiResponse,
            conversationTitle,
            isFirstMessage: false,
            timestamp: new Date(),
        })
        await Log.create({
            userId,
            action: "Sent Message in Existing Doubt Chat",
            details: `User message: ${message.slice(0, 50)}...`,
            feature: "chat",
            timestamp: new Date(),
        });

        return NextResponse.json({ assistantMessage })
    } catch (error) {
        console.error("Error sending message:", error)
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }
}

export async function DELETE(req) {
    try {
        const userId = await getDataFromToken(req)
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


        const { searchParams } = new URL(req.url)
        const conversationId = searchParams.get("conversationId")

        if (!conversationId) {
            return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 })
        }

        const result = await Message.deleteMany({ userId, conversationId })
        return NextResponse.json({ message: "Conversation deleted successfully", result })
    } catch (error) {
        console.error("Error deleting conversation:", error)
        return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 })
    }
}
