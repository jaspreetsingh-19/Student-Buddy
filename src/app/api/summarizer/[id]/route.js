import connect from "@/lib/db";
import { NextResponse } from "next/server";
import Summary from "@/models/summarizer";
import { getDataFromToken } from "@/helper/getDataFromToken"
import { checkPremiumAccess } from "@/lib/checkPremium";



connect();

export async function DELETE(req, { params }) {
    try {
        const userId = await getDataFromToken(req)

        const deletedSummary = await Summary.findOneAndDelete({ _id: params.id, userId })
        if (!deletedSummary) return NextResponse.json({ error: "Summary not found" }, { status: 404 })

        return NextResponse.json({ message: "Summary deleted" })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete summary" }, { status: 500 })
    }
}


