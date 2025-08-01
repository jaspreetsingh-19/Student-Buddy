// /app/api/user/usage/route.js
import { NextResponse } from 'next/server'
import { getDataFromToken } from "@/helper/getDataFromToken"

import connect from '@/lib/db' // Adjust path to your DB connection
import User from '@/models/user'
import Usage from '@/models/usage'

connect();

export async function GET(request) {
    try {
        const userId = await getDataFromToken(request);
        if (!userId) {
            throw new Error("Unauthorized: No token or invalid token");
        }

        const user = await User.findById(userId);


        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // If user is premium, return unlimited (no need to track usage)
        const isPremiumActive = user.isPremium && new Date(user.premiumExpires) > new Date()

        if (isPremiumActive) {
            return NextResponse.json({
                doubts: 0,
                summaries: 0,
                roadmaps: 0,
                isPremium: true,
                message: 'Premium user - unlimited access'
            })
        }

        // Get today's date range for daily limits
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Get this week's date range for weekly limits
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday

        // Find usage records
        const [dailyUsage, weeklyUsage] = await Promise.all([
            Usage.findOne({
                userId: user._id,
                date: today,
                type: 'daily'
            }),
            Usage.findOne({
                userId: user._id,
                date: startOfWeek,
                type: 'weekly'
            })
        ])

        // Return current usage counts
        return NextResponse.json({
            doubts: dailyUsage?.doubts || 0,
            summaries: dailyUsage?.summaries || 0,
            roadmaps: weeklyUsage?.roadmaps || 0,
            isPremium: false,
            limits: {
                doubts: 3, // daily
                summaries: 2, // daily  
                roadmaps: 1 // weekly
            }
        })

    } catch (error) {
        console.error('Usage API Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST method to increment usage (called when user uses a feature)
export async function POST(request) {
    try {
        const userId = await getDataFromToken(request);
        if (!userId) {
            throw new Error("Unauthorized: No token or invalid token");
        }


        const { feature } = await request.json()
        console.log("Tracking feature usage:", feature)

        if (!['doubts', 'summaries', 'roadmaps'].includes(feature)) {
            return NextResponse.json(
                { error: 'Invalid feature. Only doubts, summaries, and roadmaps are allowed.' },
                { status: 400 }
            )
        }



        const user = await User.findById(userId)

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // If user is premium, don't track usage
        const isPremiumActive = user.isPremium && new Date(user.premiumExpires) > new Date()

        if (isPremiumActive) {
            return NextResponse.json({
                success: true,
                message: 'Premium user - usage not tracked'
            })
        }

        // Define limits
        const limits = {
            doubts: 3,
            summaries: 2,
            roadmaps: 1
        }

        // Determine if this is a daily or weekly feature
        const isWeeklyFeature = feature === 'roadmaps'

        let dateToUse, usageType
        if (isWeeklyFeature) {
            // Weekly tracking
            const today = new Date()
            const startOfWeek = new Date(today)
            startOfWeek.setDate(today.getDate() - today.getDay())
            startOfWeek.setHours(0, 0, 0, 0)

            dateToUse = startOfWeek
            usageType = 'weekly'
        } else {
            // Daily tracking
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            dateToUse = today
            usageType = 'daily'
        }

        // Find existing usage record
        let usage = await Usage.findOne({
            userId: user._id,
            date: dateToUse,
            type: usageType
        })

        // If no usage record exists, create one
        if (!usage) {
            usage = new Usage({
                userId: user._id,
                date: dateToUse,
                type: usageType
            })
        }

        // Check if user would exceed limit
        const currentCount = usage[feature] || 0
        const limit = limits[feature]

        if (currentCount >= limit) {
            return NextResponse.json(
                {
                    error: 'Usage limit exceeded',
                    feature,
                    used: currentCount,
                    limit,
                    message: `You've reached your ${usageType} limit for ${feature}. Upgrade to premium for unlimited access!`
                },
                { status: 429 }
            )
        }

        // Increment the usage
        usage[feature] = currentCount + 1
        await usage.save()

        const newCount = usage[feature]

        return NextResponse.json({
            success: true,
            feature,
            used: newCount,
            limit,
            remaining: limit - newCount,
            message: newCount >= limit
                ? `You've reached your ${usageType} limit for ${feature}!`
                : `${feature} used: ${newCount}/${limit} (${limit - newCount} remaining)`
        })

    } catch (error) {
        console.error('Usage increment error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}