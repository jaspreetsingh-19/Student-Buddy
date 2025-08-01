"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
    Sparkles,
    Check,
    Loader2,
    Search,
    BookOpen,
    Trash2,
    History,
    AlertCircle,
    FileText,
    ExternalLink,
} from "lucide-react"

export default function ExploreResourcesPage() {
    const [topicInput, setTopicInput] = useState("")
    const [currentResource, setCurrentResource] = useState(null)
    const [previousSearches, setPreviousSearches] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [showHistory, setShowHistory] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchPreviousSearches()
    }, [])

    const fetchPreviousSearches = async () => {
        try {
            const response = await axios.get("/api/resources")
            setPreviousSearches(response.data.resources || [])
            console.log("fetch response is ", response.data)

            // Toast for successful load
            if (response.data.resources && response.data.resources.length > 0) {
                toast.success(`Loaded ${response.data.resources.length} previous searches`)
            }
        } catch (error) {
            console.error("Failed to fetch previous searches:", error)
            toast.error("Failed to load previous searches")
        }
    }

    const handleGenerateResources = async () => {
        setIsLoading(true)
        setError(null)
        setCurrentResource(null)

        // Loading toast
        toast.loading("Generating AI-powered resources...", { id: "generate-resources" })

        try {
            const response = await axios.post("/api/resources", { topic: topicInput })
            console.log("POST response:", response.data)

            const newResource = response.data.resource
            setCurrentResource(newResource)
            console.log("currentResource set to:", newResource)

            await fetchPreviousSearches()
            toast.success("Resources generated successfully!", { id: "generate-resources" })
            setTopicInput("")
        } catch (error) {
            console.error("Resource generation failed:", error)
            const errorMessage = error.response?.data?.error || "Failed to generate resources"
            setError(errorMessage)
            toast.error(errorMessage, { id: "generate-resources" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteSearch = async (searchId) => {
        try {
            toast.loading("Deleting search...", { id: "delete-search" })

            await axios.delete(`/api/resources/${searchId}`)
            setPreviousSearches((prev) => prev.filter((s) => s._id !== searchId))
            if (currentResource?._id === searchId) {
                setCurrentResource(null)
            }
            toast.success("Search deleted successfully", { id: "delete-search" })
        } catch (error) {
            console.error("Failed to delete search:", error)
            toast.error("Failed to delete search", { id: "delete-search" })
        }
    }

    const loadPreviousSearch = (search) => {
        setCurrentResource(search)
        setTopicInput(search.topic)
        setShowHistory(false)
        setError(null)

        // Toast for loading previous search
        toast.info(`Loaded resources for: ${search.topic}`)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const formatResourceText = (text) => {
        if (!text) return ""

        const lines = text.split("\n").filter((line) => line.trim())

        return lines.map((line, index) => {
            // Checking for a section header
            if (
                line.includes(":") &&
                (line.toLowerCase().includes("topic") ||
                    line.toLowerCase().includes("overview") ||
                    line.toLowerCase().includes("resources") ||
                    line.toLowerCase().includes("links") ||
                    line.toLowerCase().includes("books") ||
                    line.toLowerCase().includes("youtube") ||
                    line.toLowerCase().includes("courses") ||
                    line.toLowerCase().includes("bonus"))
            ) {
                return (
                    <h3 key={index} className="font-semibold text-lg mt-6 mb-3 text-primary border-b border-border pb-1">
                        {line}
                    </h3>
                )
            }

            // Function to convert URLs to clickable links
            const makeLinksClickable = (text) => {
                const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g
                const parts = text.split(urlRegex)

                return parts.map((part, partIndex) => {
                    if (urlRegex.test(part)) {
                        return (
                            <a
                                key={partIndex}
                                href={part}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline inline-flex items-center gap-1 break-all"
                                onClick={() => toast.info("Opening external link")}
                            >
                                {part}
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </a>
                        )
                    }
                    return part
                })
            }

            // Regular paragraph
            if (line.trim()) {
                return (
                    <p key={index} className="mb-3 text-sm leading-relaxed">
                        {makeLinksClickable(line)}
                    </p>
                )
            }

            return null
        })
    }

    const toggleHistory = () => {
        setShowHistory(!showHistory)
        toast.info(showHistory ? "History panel hidden" : "History panel shown")
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Explore Resources</h1>
                    <p className="text-muted-foreground">Discover the best learning resources for any topic with AI</p>
                </div>
                <Button variant="outline" onClick={toggleHistory} className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    {showHistory ? "Hide History" : "View History"}
                    {previousSearches.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                            {previousSearches.length}
                        </Badge>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className={cn("space-y-6", showHistory ? "lg:col-span-2" : "lg:col-span-3")}>
                    {/* Input Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5" />
                                Generate Resources
                            </CardTitle>
                            <CardDescription>Enter a topic and let AI find the best learning resources for you</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <Input
                                    placeholder="e.g., React Hooks, Machine Learning, CSS Grid..."
                                    value={topicInput}
                                    onChange={(e) => setTopicInput(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleGenerateResources()}
                                    className="text-base"
                                    disabled={isLoading}
                                />
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-muted-foreground">{topicInput.length} characters</span>

                                        {topicInput.length >= 1 && (
                                            <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                                <Check className="h-3 w-3" />
                                                Ready to generate
                                            </span>
                                        )}
                                    </div>
                                    <Button
                                        onClick={handleGenerateResources}
                                        disabled={isLoading || topicInput.trim().length < 1}
                                        className="px-6"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="h-4 w-4 mr-2" />
                                                Generate Resources
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Current Resource Display */}
                    {currentResource && currentResource.resources && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="flex items-center gap-2">
                                            <BookOpen className="h-5 w-5" />
                                            Resources for "{currentResource.topic}"
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-4">
                                            <span>AI-generated learning resources</span>
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                <Sparkles className="h-3 w-3" />
                                                AI Generated
                                            </Badge>
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            {/* THIS WAS MISSING - The actual content display */}
                            <CardContent>
                                <ScrollArea className="h-[500px] w-full rounded-md border p-6">
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <div className="space-y-1">{formatResourceText(currentResource.resources)}</div>
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Generating Resources...</h3>
                                <p className="text-muted-foreground text-center max-w-md">
                                    AI is analyzing your topic and finding the best learning resources...
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Empty State */}
                    {!currentResource && !isLoading && (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No Resources Yet</h3>
                                <p className="text-muted-foreground text-center max-w-md">
                                    Enter a topic above to generate your first AI-powered resource collection.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* History Sidebar */}
                {showHistory && (
                    <div className="lg:col-span-1">
                        <Card className="h-fit">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5" />
                                    Previous Searches
                                </CardTitle>
                                <CardDescription>{previousSearches.length} searches saved</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[600px]">
                                    {previousSearches.length === 0 ? (
                                        <div className="p-6 text-center text-muted-foreground">
                                            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No previous searches</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1 p-2">
                                            {previousSearches.map((search, index) => (
                                                <div key={search._id}>
                                                    <div
                                                        className={cn(
                                                            "p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent",
                                                            currentResource?._id === search._id && "bg-accent",
                                                        )}
                                                        onClick={() => loadPreviousSearch(search)}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-medium truncate">{search.topic}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <p className="text-xs text-muted-foreground">{formatDate(search.createdAt)}</p>
                                                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                                                        <FileText className="h-3 w-3 mr-1" />
                                                                        Resource
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleDeleteSearch(search._id)
                                                                }}
                                                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {index < previousSearches.length - 1 && <Separator className="my-1" />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}