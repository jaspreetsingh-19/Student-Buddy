"use client"
import { useEffect, useState } from "react"
import axios from "axios"
import { getQuote } from "@/lib/quotes"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BadgeCheck, Clock, Calendar, AlertCircle, CheckCircle2, Plus } from "lucide-react"

export default function GreetingThought() {
    const [quote, setQuote] = useState("")
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [tasksLoading, setTasksLoading] = useState(true)
    const [tasks, setTasks] = useState([])

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true)
                setTasksLoading(true)

                // Fetch user and quote
                const userRes = await axios.get("/api/auth/me")
                setUser(userRes.data)
                const q = await getQuote()
                setQuote(q)

                // Fetch remaining tasks
                const tasksRes = await axios.get("/api/dashboard")
                console.log("task", tasksRes)
                setTasks(tasksRes.data.remainingTask)

            } catch (error) {
                console.error("Error fetching data:", error)
            } finally {
                setLoading(false)
                setTasksLoading(false)
            }
        }

        fetchAllData()
    }, [])

    // Only show content when all data including tasks are loaded
    if (loading || tasksLoading) {
        return (
            <div className="space-y-4">
                <Card className="mb-4">
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                </Card>

                <Card className="shadow-md">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-lg">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-4 rounded-xl border border-gray-100">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                            <div className="flex gap-2">
                                                <Skeleton className="h-5 w-16 rounded-full" />
                                                <Skeleton className="h-5 w-20 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <>
            <Card className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">👋</span>
                        <span className="text-lg font-medium text-gray-800">
                            Hi, {user?.data.username}!
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-2">
                        <span className="text-lg">💭</span>
                        <p className="text-gray-700 italic leading-relaxed">{quote}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-lg">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-semibold flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-gray-800">Remaining Tasks</span>
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {tasks.length} left
                            </span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    {tasks.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="mb-6">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                                </div>

                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                All caught up!
                            </h3>
                            <p className="text-gray-600 max-w-sm mx-auto">
                                You've completed all your tasks. Time to relax or add some new goals!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tasks.slice(0, 5).map((task, index) => {
                                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()
                                const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString()
                                const dueSoon = task.dueDate && new Date(task.dueDate) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // Within 2 days

                                return (
                                    <div
                                        key={task._id}
                                        className={`group p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${isOverdue
                                            ? 'border-red-200 bg-red-50/50 hover:bg-red-50'
                                            : isDueToday
                                                ? 'border-orange-200 bg-orange-50/50 hover:bg-orange-50'
                                                : dueSoon
                                                    ? 'border-yellow-200 bg-yellow-50/50 hover:bg-yellow-50'
                                                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-grow min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <h4 className={`font-medium text-sm leading-tight group-hover:text-blue-800 transition-colors ${isOverdue ? 'text-red-800' : 'text-gray-800'
                                                        }`}>
                                                        {task.title}
                                                    </h4>
                                                    {(task.priority === 'high' || isOverdue) && (
                                                        <AlertCircle className={`w-4 h-4 flex-shrink-0 ${isOverdue ? 'text-red-500' : 'text-orange-500'
                                                            }`} />
                                                    )}
                                                </div>

                                                {task.description && (
                                                    <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                                                        {task.description}
                                                    </p>
                                                )}

                                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                                    {task.category && (
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                                            {task.category}
                                                        </span>
                                                    )}
                                                    {task.priority && (
                                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${task.priority === 'high'
                                                            ? 'bg-red-100 text-red-700'
                                                            : task.priority === 'medium'
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-green-100 text-green-700'
                                                            }`}>
                                                            {task.priority} priority
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-3">
                                                        {task.dueDate && (
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3 text-gray-400" />
                                                                <span className={`font-medium ${isOverdue
                                                                    ? 'text-red-600'
                                                                    : isDueToday
                                                                        ? 'text-orange-600'
                                                                        : dueSoon
                                                                            ? 'text-yellow-600'
                                                                            : 'text-gray-500'
                                                                    }`}>
                                                                    {isOverdue
                                                                        ? `Overdue ${Math.ceil((new Date() - new Date(task.dueDate)) / (1000 * 60 * 60 * 24))}d`
                                                                        : isDueToday
                                                                            ? 'Due today'
                                                                            : `Due ${new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}

                                                        {task.createdAt && (
                                                            <div className="flex items-center gap-1">
                                                                <Plus className="w-3 h-3 text-gray-400" />
                                                                <span className="text-gray-500">
                                                                    Created {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                            {tasks.length > 5 && (
                                <div className="text-center pt-4 border-t border-gray-100">
                                    <button className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
                                        View {tasks.length - 5} more tasks
                                        <BadgeCheck className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    )
}