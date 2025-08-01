import { NextResponse } from "next/server";
import Log from "@/models/logs";
import connect from "@/lib/db";



connect();
console.log("connect", connect)
export async function GET(request) {
    try {





        const usage = await Log.aggregate([
            {
                $group: {
                    _id: "$feature",
                    count: { $sum: 1 },
                },
            },
        ]);

        const result = usage.map((item) => ({
            feature: item._id,
            count: item.count,
        }));

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch analytics", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
