import connect from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import ExploreResource from "@/models/resources"
import { getDataFromToken } from "@/helper/getDataFromToken"

connect()



export async function DELETE(request, { params }) {
    try {
        const userId = await getDataFromToken(request)
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const deletedResource = await ExploreResource.findOneAndDelete({ _id: params.id, userId })
        if (!deletedResource) return NextResponse.json({ error: "Resource not found" }, { status: 404 })



        return NextResponse.json({ message: "Resource deleted" })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 })
    }
}
