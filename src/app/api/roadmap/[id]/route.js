import connect from "@/lib/db";
import { NextResponse } from "next/server";
import Roadmap from "@/models/roadmap";

import { getDataFromToken } from "@/helper/getDataFromToken"
import { checkPremiumAccess } from "@/lib/checkPremium";

connect();

export async function DELETE(request, { params }) {
    try {
        const userId = await getDataFromToken(request)
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const deletedRoadmap = await Roadmap.findOneAndDelete({ _id: params.id, userId })
        if (!deletedRoadmap) return NextResponse.json({ error: "Roadmap not found" }, { status: 404 })

        return NextResponse.json({ message: "Roadmap deleted" })
    } catch (error) {
        console.log("error in roadmap delete", error)
        return NextResponse.json({ error: "Failed to delete roadmap" }, { status: 500 })
    }
}


