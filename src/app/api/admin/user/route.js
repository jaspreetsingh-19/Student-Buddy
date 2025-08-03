import { NextResponse } from "next/server"
import User from "@/models/user"
import connect from "@/lib/db";
import { isAdmin } from "@/lib/adminProtect"

connect();

export async function GET(request) {


    try {
        const users = await User.find().select("-password")
        return NextResponse.json(users)

    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });

    }
}


export async function DELETE(request) {

    try {
        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }
        const deletedUser = await User.findByIdAndDelete(userId);
        return NextResponse.json({ message: "User deleted successfully", user: deletedUser, success: true }, { status: 200 });

    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });

    }
}


export async function PATCH(request) {

    try {

        const { userId, actionRequest } = await request.json()

        if (actionRequest === "PROMOTE") {
            await User.findByIdAndUpdate(userId, { role: "admin" })
            return NextResponse.json({ success: true })

        } else if (actionRequest === "DEMOTE") {
            await User.findByIdAndUpdate(userId, { role: "student" })
            return NextResponse.json({ success: true })
        }


    } catch (err) {
        return NextResponse.json({ error: "Failed to promote user" }, { status: 500 })
    }
}

