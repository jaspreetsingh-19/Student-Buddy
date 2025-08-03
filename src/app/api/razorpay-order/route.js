import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import connect from "@/lib/db";
import Payment from "@/models/payment";
import { getDataFromToken } from "@/helper/getDataFromToken";

await connect();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
    try {
        const userId = await getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { amount, premiumType } = await req.json();

        const options = {
            amount: amount * 100, // in paise
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
            notes: {
                userId,
                premiumType,
            },
        };


        const razorpayOrder = await razorpay.orders.create(options);


        const payment = await Payment.create({
            userId,
            amount,
            orderId: razorpayOrder.id,
            currency: "INR",
            premiumType,
            status: "pending",
        });

        return NextResponse.json(
            {
                order: razorpayOrder,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("error in payment:", error);
        return NextResponse.json({ error: `Something went wrong ${error}` }, { status: 500 });
    }
}
