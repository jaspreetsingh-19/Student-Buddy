import connect from "@/lib/db"
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user"
import bcrypt from "bcryptjs";
import sendVerificationEmail from "@/helper/mailtrap.config"

console.log("signup route called")

connect()

export async function POST(request) {
    try {
        const reqBody = await request.json()
        const { username, email, password } = reqBody

        // Check if user already exists
        const check = await User.findOne({ email })
        if (check) {
            // If user exists but not verified, delete and let them re-register
            if (!check.isVerified) {
                await User.deleteOne({ email })
            } else {
                return NextResponse.json({ error: "User already exists" }, { status: 400 })
            }
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        console.log("verificationToken", verificationToken)

        // Save user as unverified
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
            isVerified: false  // <-- not verified yet
        })

        // Send email FIRST, only save if email succeeds
        try {
            await sendVerificationEmail(email, verificationToken)
        } catch (emailError) {
            console.error("Email failed, aborting signup:", emailError);
            return NextResponse.json({ 
                error: "Failed to send verification email. Please try again." 
            }, { status: 500 })
        }

        // Only save to DB after email is sent successfully
        const savedUser = await newUser.save()

        return NextResponse.json({ 
            message: "Account created! Please check your email to verify.", 
            success: true 
        })

    } catch (error) {
        console.error("Error during signup:", error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}