"use client"

import Link from "next/link"

import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"

import { toast } from 'sonner';


export default function SignupPage() {

    const [user, setUser] = useState({
        username: "",
        email: "",
        password: ""

    })
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    async function handleSignup(e) {
        e.preventDefault()
        try {
            setLoading(true)
            console.log("started")
            const response = await axios.post("/api/auth/signup", user)
            console.log("ended")
            console.log("registered", response.data)
            toast.success("registered")
            router.push("/auth/verify-email")

        } catch (error) {

            console.log("error occured", error)
            console.log("❌ Backend error:", error.response?.data);
            toast.error(error.response?.data.error)
            setLoading(false)
        } finally {
            setLoading(false)
        }

    }
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">


                {/* Login Card */}
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                    {/* Header */}
                    <div className="p-6 pb-4 text-center">
                        <h1 className="text-xl font-semibold text-gray-900">Welcome</h1>
                        <p className="mt-2 text-sm text-gray-600">Signup with your Apple or Google account</p>
                    </div>

                    {/* Content */}
                    <div className="p-6 pt-0">
                        <form onSubmit={handleSignup}>
                            <div className="space-y-6">
                                {/* Social Signup Buttons */}
                                <div className="flex flex-col gap-4">
                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                                        </svg>
                                        Signup with Apple
                                    </button>
                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                                        </svg>
                                        Signup with Google
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="bg-white px-2 text-gray-500">Or continue with</span>
                                    </div>
                                </div>

                                {/* Email and Password Form */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                                Username
                                            </label>

                                        </div>
                                        <input
                                            id="username"
                                            type="text"
                                            required
                                            value={user.username}
                                            onChange={(e) => setUser({ ...user, username: e.target.value })}
                                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="m@example.com"
                                            required
                                            value={user.email}
                                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                                Password
                                            </label>

                                        </div>
                                        <input
                                            id="password"
                                            type="password"
                                            required
                                            value={user.password}
                                            onChange={(e) => setUser({ ...user, password: e.target.value })}
                                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                                    >
                                        Signup
                                    </button>
                                </div>

                                {/* Login link */}
                                <div className="text-center text-sm text-gray-600">
                                    {"Already have an Account! "}
                                    <Link href={"/auth/login"} className="underline underline-offset-4 hover:text-gray-900">
                                        Login
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>



            </div>
        </div>
    )
}
