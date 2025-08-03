import crypto from "crypto";
import { NextResponse } from "next/server";
import connect from "@/lib/db";
import User from "@/models/user";
import { getDataFromToken } from "@/helper/getDataFromToken"


export async function POST(req) {
    const userId = await getDataFromToken(req)
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    await connect();
    const body = await req.json();

    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,

        premiumType,
    } = body;

    const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

    if (generated_signature !== razorpay_signature) {
        return new NextResponse("Invalid payment signature", { status: 400 });
    }


    let expiresAt = new Date();
    if (premiumType === "monthly") {
        expiresAt.setDate(expiresAt.getDate() + 30);
    } else if (premiumType === "yearly") {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
        return new NextResponse("Invalid premium type", { status: 400 });
    }

    try {
        await User.findByIdAndUpdate(userId, {
            isPremium: true,
            premiumType: premiumType,
            premiumExpiresAt: expiresAt,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("MongoDB update failed:", error);
        return new NextResponse("Failed to update user", { status: 500 });
    }
}
