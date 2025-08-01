"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { FileText, Trash2, Loader2, History, Copy, Check, AlertCircle, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { cn } from "@/lib/utils"



export default function SummarizerPage() {
    const [textInput, setTextInput] = useState("")
    const [currentSummary, setCurrentSummary] = useState(null)
    const [previousSummaries, setPreviousSummaries] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [showHistory, setShowHistory] = useState(false)
    const [copiedId, setCopiedId] = useState(null)
    const [error, setError] = useState(null)
    const [usageCount, setUsageCount] = useState({});


    useEffect(() => {
        fetchPreviousSummaries()

    }, [])

    const fetchPreviousSummaries = async () => {
        try {
            const response = await axios.get("/api/summarizer")
            setPreviousSummaries(response.data)
            toast.success("Previous summaries loaded successfully")
        } catch (error) {
            console.error("Failed to fetch previous summaries:", error)
            toast.error("Failed to load previous summaries")
        }
    }

    const handleSummarize = async () => {


        if (textInput.trim().length < 50) {
            toast.error("Please enter at least 50 characters for a meaningful summary")
            return
        }

        setIsLoading(true)
        setError(null)
        toast.loading("Starting text summarization...", { id: "summarize-toast" })

        try {

            const response = await axios.post("/api/summarizer", { input: textInput })



            const newSummary = {
                _id: Date.now().toString(),
                originalInput: textInput,
                summary: response.data.summary,

                createdAt: new Date().toISOString(),
            }

            setCurrentSummary(newSummary)
            const usageRes = await axios.get("/api/usage");
            setUsageCount(usageRes.data);
            await fetchPreviousSummaries()
            toast.success("Text summarized successfully!", { id: "summarize-toast" })

            // Clear input after successful summarization
            setTextInput("")
            toast.info("Input field cleared - ready for next text")
        } catch (error) {
            console.error("Summarization failed:", error)
            const errorMessage = error.response?.data?.error || "Failed to summarize content"
            setError(errorMessage)
            toast.error(`Summarization failed: ${errorMessage}`, { id: "summarize-toast" })

        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteSummary = async (summaryId) => {
        try {
            toast.loading("Deleting summary...", { id: "delete-toast" })
            await axios.delete(`/api/summarizer/${summaryId}`)
            setPreviousSummaries((prev) => prev.filter((s) => s._id !== summaryId))
            if (currentSummary?._id === summaryId) {
                setCurrentSummary(null)
                toast.info("Current summary cleared")
            }
            toast.success("Summary deleted successfully", { id: "delete-toast" })
        } catch (error) {
            console.error("Failed to delete summary:", error)
            toast.error("Failed to delete summary", { id: "delete-toast" })
        }
    }

    const handleCopySummary = async (summary, id) => {
        try {
            await navigator.clipboard.writeText(summary)
            setCopiedId(id)
            toast.success("Summary copied to clipboard!")
            setTimeout(() => setCopiedId(null), 2000)
        } catch (error) {
            toast.error("Failed to copy summary")
        }
    }

    const loadPreviousSummary = (summary) => {
        setCurrentSummary(summary)
        setTextInput(summary.originalInput)
        setShowHistory(false)
        setError(null)
        toast.success("Previous summary loaded successfully")
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

    const getPreviewText = (text, maxLength = 50) => {
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
    }

    const handleHistoryToggle = () => {
        setShowHistory(!showHistory)
        if (!showHistory) {
            toast.info("History panel opened")
        } else {
            toast.info("History panel closed")
        }
    }

    const handleTextInputChange = (e) => {
        const newValue = e.target.value
        setTextInput(newValue)

        // Clear error when user starts typing
        if (error && newValue.length > 0) {
            setError(null)
            toast.success("Error cleared - you can try again")
        }

        // Show helpful toast when reaching minimum length
        if (newValue.length === 50) {
            toast.success("Minimum character count reached - ready to summarize!")
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Text Summarizer</h1>
                    <p className="text-muted-foreground">Get AI-powered summaries of any text content instantly</p>
                </div>
                <Button variant="outline" onClick={handleHistoryToggle} className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    {showHistory ? "Hide History" : "View History"}
                    {previousSummaries.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                            {previousSummaries.length}
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
                                <Type className="h-5 w-5" />
                                Enter Text Content
                            </CardTitle>
                            <CardDescription>Paste your text content below to generate an AI-powered summary</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <Textarea
                                    placeholder="Paste your text content here to generate a summary... "



                                    value={textInput}
                                    onChange={handleTextInputChange}
                                    className="min-h-[200px] resize-none"
                                    disabled={isLoading}
                                />
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-muted-foreground">{textInput.length} characters</span>
                                        {textInput.length > 0 && textInput.length < 50 && (
                                            <span className="text-sm text-amber-600 dark:text-amber-400">Minimum 50 characters required</span>
                                        )}
                                        {textInput.length >= 50 && (
                                            <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                                <Check className="h-3 w-3" />
                                                Ready to summarize
                                            </span>
                                        )}
                                    </div>
                                    <Button
                                        onClick={handleSummarize}
                                        disabled={isLoading}
                                        className="px-6"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Summarizing...
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="h-4 w-4 mr-2" />
                                                Summarize Text
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

                    {/* Current Summary Display */}
                    {currentSummary && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Summary
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-4">
                                            <span>Text Content ({currentSummary.originalInput.length} characters)</span>
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                <Type className="h-3 w-3" />
                                                Text
                                            </Badge>
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCopySummary(currentSummary.summary, currentSummary._id)}
                                        >
                                            {copiedId === currentSummary._id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                                            {currentSummary.summary.split("\n").map((line, index) => (
                                                <p key={index} className="mb-2">
                                                    {line}
                                                </p>
                                            ))}
                                        </div>
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
                                <h3 className="text-lg font-semibold mb-2">Processing Text...</h3>
                                <p className="text-muted-foreground text-center max-w-md">
                                    Analyzing your content and generating an AI-powered summary...
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Empty State */}
                    {!currentSummary && !isLoading && (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Type className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No Summary Yet</h3>
                                <p className="text-muted-foreground text-center max-w-md">
                                    Paste your text content above to generate your first AI-powered summary.
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
                                    Previous Summaries
                                </CardTitle>
                                <CardDescription>{previousSummaries.length} summaries saved</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[600px]">
                                    {previousSummaries.length === 0 ? (
                                        <div className="p-6 text-center text-muted-foreground">
                                            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No previous summaries</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1 p-2">
                                            {previousSummaries.map((summary, index) => (
                                                <div key={summary._id}>
                                                    <div
                                                        className={cn(
                                                            "p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent",
                                                            currentSummary?._id === summary._id && "bg-accent",
                                                        )}
                                                        onClick={() => loadPreviousSummary(summary)}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-medium truncate">
                                                                    {getPreviewText(summary.originalInput, 40)}
                                                                </h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <p className="text-xs text-muted-foreground">{formatDate(summary.createdAt)}</p>
                                                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                                                        {summary.originalInput.length} chars
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleDeleteSummary(summary._id)
                                                                }}
                                                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {index < previousSummaries.length - 1 && <Separator className="my-1" />}
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