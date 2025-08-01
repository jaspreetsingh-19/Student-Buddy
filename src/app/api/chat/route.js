import connect from "@/lib/db";
import { NextResponse } from "next/server";
import Message from "@/models/message";
import { getAIResponse } from "@/lib/aiForChatbot"
import { getDataFromToken } from "@/helper/getDataFromToken"
import Log from "@/models/logs"
import User from "@/models/user"
import { checkPremiumAccess } from "@/lib/checkPremium";



connect();
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
export async function GET(req) {



    const userId = await getDataFromToken(req)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });



    try {
        const allMessages = await Message.find({ userId })
            .sort({ timestamp: 1 });
        const conversationGroups = {};

        allMessages.forEach(message => {
            const convId = message.conversationId;

            // If this conversation doesn't exist in our groups, create it
            if (!conversationGroups[convId]) {
                conversationGroups[convId] = [];
            }

            // Add message to this conversation group
            conversationGroups[convId].push(message);
        });

        // Convert grouped messages into conversation summaries
        const conversations = [];

        for (const [conversationId, messages] of Object.entries(conversationGroups)) {
            const firstMessage = messages[0]; // First message (oldest)
            const lastMessage = messages[messages.length - 1]; // Last message (newest)
            const messageCount = messages.length;

            conversations.push({
                conversationId: conversationId,
                title: firstMessage.content.substring(0, 50), // First 50 chars as title
                messageCount: messageCount,
                lastActivity: lastMessage.timestamp,
                preview: lastMessage.content.substring(0, 100) // Last 100 chars as preview
            });
        }

        // Sort conversations by last activity (newest first)
        conversations.sort((a, b) => {
            return new Date(b.lastActivity) - new Date(a.lastActivity);
        });

        return NextResponse.json({ conversations });

    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }
}


export async function POST(req) {

    const userId = await getDataFromToken(req)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { message, conversationTitle } = await req.json();


    try {

        const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const usageStatus = await trackUsage(userId, "doubts");

        if (!usageStatus.allowed) {
            return NextResponse.json({ error: usageStatus.message }, { status: 403 });
        }


        const userMessage = await Message.create({
            userId,
            conversationId,
            role: 'user',
            content: message,
            conversationTitle: conversationTitle || 'Student Doubt Chat',
            isFirstMessage: true,
            timestamp: new Date()
        });


        // Get AI response (no history for first message)
        const aiResponse = await getAIResponse(message, []);

        // Save AI response
        const assistantMessage = await Message.create({
            userId,
            conversationId,
            role: 'assistant',
            content: aiResponse,
            conversationTitle: conversationTitle || 'Student Doubt Chat',
            isFirstMessage: false,
            timestamp: new Date()
        });

        await Log.create({
            userId,
            action: "Started Doubt Chat",
            details: `Initial question: ${message.slice(0, 50)}...`,
            feature: "chatbot",
            timestamp: new Date()
        });

        return NextResponse.json({
            conversationId,
            userMessage,
            assistantMessage
        });

    } catch (error) {
        console.error('Error starting conversation:', error);
        return NextResponse.json({ error: 'Failed to start conversation' }, { status: 500 });
    }
}
