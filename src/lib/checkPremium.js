import { getDataFromToken } from "@/helper/getDataFromToken"
import User from "@/models/user";
import connect from "@/lib/db";

connect();
export async function checkPremiumAccess(req) {

    const userId = await getDataFromToken(req);
    if (!userId) {
        throw new Error("Unauthorized: No token or invalid token");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    const isExpired = new Date(user.premiumExpiresAt) < new Date();

    if (!user.isPremium || isExpired) {
        throw new Error("Access denied: Not a premium user");
    }

    return user;
}
