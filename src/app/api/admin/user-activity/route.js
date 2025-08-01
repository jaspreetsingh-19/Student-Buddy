// pages/api/admin/user-activity.js or app/api/admin/user-activity/route.js

import { NextResponse } from 'next/server';
import User from "@/models/user"
import connect from "@/lib/db";

connect();
export async function GET() {
    try {
        // Get user login data grouped by date from lastLogin field
        const userLoginData = await User.aggregate([
            {
                $match: {
                    lastLogin: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$lastLogin"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    date: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]);

        return NextResponse.json(userLoginData);
    } catch (error) {
        console.error('Error fetching user activity:', error);
        return NextResponse.json({ error: 'Failed to fetch user activity' }, { status: 500 });
    }
}