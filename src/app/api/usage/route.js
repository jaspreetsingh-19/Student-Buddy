import { NextResponse } from 'next/server'
import { getDataFromToken } from "@/helper/getDataFromToken"

import connect from '@/lib/db'
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

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())

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


        const isWeeklyFeature = feature === 'roadmaps'

        let dateToUse, usageType
        if (isWeeklyFeature) {
            const today = new Date()
            const startOfWeek = new Date(today)
            startOfWeek.setDate(today.getDate() - today.getDay())
            startOfWeek.setHours(0, 0, 0, 0)

            dateToUse = startOfWeek
            usageType = 'weekly'
        } else {

            const today = new Date()
            today.setHours(0, 0, 0, 0)

            dateToUse = today
            usageType = 'daily'
        }


        let usage = await Usage.findOne({
            userId: user._id,
            date: dateToUse,
            type: usageType
        })


        if (!usage) {
            usage = new Usage({
                userId: user._id,
                date: dateToUse,
                type: usageType
            })
        }

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