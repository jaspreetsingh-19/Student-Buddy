"use client"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function CallbackPage() {
    const router = useRouter()
    const params = useSearchParams()
    const token = params.get("token")

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token)
            router.push("/dashboard")
        }
    }, [token])

    return <p>Logging you in...</p>
}
