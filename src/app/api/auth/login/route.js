import connect from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

connect()
export async function POST(request) {
    try {
        const reqBody = await request.json()
        const { email, password } = reqBody
        const existingUser = await User.findOne({ email })
        if (!existingUser) {
            return NextResponse.json({ error: "user do not exist" }, { status: 400 })
        }
        const match = await bcrypt.compare(password, existingUser.password)
        if (!match) {
            return NextResponse.json({ error: "wrong password" }, { status: 400 })
        }
        const tokenData = {
            id: existingUser._id,
            username: existingUser.username,
            email: existingUser.email,
            role: existingUser.role
        }
        console.log("Before update:", existingUser);
        existingUser.lastLogin = new Date();
        await existingUser.save();
        console.log("after update:", existingUser);
        console.log("last login date saved")

        const token = jwt.sign(tokenData, process.env.TOKEN_SECRET, { expiresIn: "7d" })


        const response = NextResponse.json({
            message: "login successful",
            success: true,
            role: existingUser.role,
        })
        response.cookies.set("token", token, { httpOnly: true })
        return response

    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 })
    }
}




















