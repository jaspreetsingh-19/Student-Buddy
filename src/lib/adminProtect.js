export async function isAdmin(request) {
    try {
        const token = request.cookies.get("token")?.value;
        if (!token) {
            console.log("No token found");
            return false;
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        console.log("Decoded JWT Payload:", payload);

        if (payload.role !== "admin") {
            console.log("User is not admin");
            return false;
        }

        return true;
    } catch (err) {
        console.error("JWT verify failed:", err);
        return false;
    }
}
