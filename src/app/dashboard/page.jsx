"use client"
import { useEffect, useState } from "react"
import axios from "axios"
import { getQuote } from "@/lib/quotes"
import { Card, CardHeader, CardContent } from "@/components/ui/card"


export default function GreetingThought() {
    const [quote, setQuote] = useState("")
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)



    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                // Get user
                const res = await axios.get("/api/auth/me")


                setUser(res.data)

                // Get quote only after user is fetched
                const q = await getQuote()
                setQuote(q)

            } catch (error) {
                console.error("Error fetching user or quote:", error)
            } finally {
                setLoading(false)
            }
        }


        fetchData()
    }, [])

    if (loading) {
        return <div className="text-muted">Loading, please wait...</div>
    }

    return (
        <>
            <Card className="mb-4">
                <CardHeader>
                    👋 Hi, {user?.data.username}
                </CardHeader>
                <CardContent>
                    💭 <i>{quote}</i>
                </CardContent>
            </Card>



        </>
    )
}
