import crypto from "crypto";
import { NextResponse } from "next/server";
import connect from "@/lib/db";
import User from "@/models/user";
import Payment from "@/models/payment";

connect();
export async function POST(req) {

    try {
        const rawBody = await req.text();
        const razorpaySignature = req.headers.get("x-razorpay-signature");

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(rawBody)
            .digest("hex");

        if (razorpaySignature !== expectedSignature) {
            return new NextResponse("Invalid webhook signature", { status: 400 });
        }

        const body = JSON.parse(rawBody);
        const payment = body.payload.payment.entity;
        const notes = payment.notes;
        const userId = notes?.userId;
        const premiumType = notes?.premiumType;

        if (!userId || !premiumType) {
            return new NextResponse("Missing user info in webhook", { status: 400 });
        }

        let expiresAt = new Date();
        if (premiumType === "monthly") {
            expiresAt.setDate(expiresAt.getDate() + 30);
        } else if (premiumType === "yearly") {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        }


        // ✅ Update user
        await User.findByIdAndUpdate(userId, {
            isPremium: true,
            premiumType,
            premiumExpiresAt: expiresAt,
        });

        // ✅ Update payment status
        await Payment.findOneAndUpdate(
            { orderId: payment.order_id },
            {
                paymentId: payment.id,
                status: "sucess",
                paidAt: new Date(),
            }
        );

        return NextResponse.json({ success: true });

    }
    catch (error) {
        console.error("Webhook DB update failed:", error);
        return new NextResponse("DB update failed", { status: 500 });
    }
}
