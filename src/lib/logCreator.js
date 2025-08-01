import Log from "@/models/logs"
import connect from "@/lib/db"


connect();
console.log("connect", connect)

export async function createLog(userId, action, details, timestamp, feature) {
    try {
        await Log.create({ userId, action, details, timestamp, feature });
        console.log("Log created successfully");
    } catch (error) {
        console.error("Error creating log:", error);
    }
}