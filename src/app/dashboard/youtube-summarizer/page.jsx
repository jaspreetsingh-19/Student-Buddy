"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
    Youtube, Play, BookOpen, Lightbulb, HelpCircle, List,
    Tag, ChevronDown, ChevronUp, Trash2, Loader2, Sparkles,
    ArrowLeft, Clock, AlertCircle, ExternalLink, CheckCircle,
    TrendingUp, FileText, Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

// ─── Summarizing overlay ──────────────────────────────────────────────────────
const SummarizingOverlay = ({ url }) => {
    const msgs = ["Fetching video info", "Getting transcript", "Reading content", "Identifying key points", "Writing summary", "Generating questions"]
    const [idx, setIdx] = useState(0)
    const [prog, setProg] = useState(0)
    useEffect(() => {
        const m = setInterval(() => setIdx(p => (p + 1) % msgs.length), 2200)
        const p = setInterval(() => setProg(p => Math.min(p + Math.random() * 6, 90)), 700)
        return () => { clearInterval(m); clearInterval(p) }
    }, [])
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Card className="w-full max-w-sm mx-4 shadow-2xl border-2 border-red-500/20">
                <CardContent className="pt-10 pb-10 flex flex-col items-center gap-5 text-center">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                        <div className="relative p-5 rounded-full bg-red-500/10">
                            <Youtube className="h-10 w-10 text-red-500 animate-pulse" />
                        </div>
                        <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-400 animate-spin" style={{ animationDuration: "3s" }} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Summarising Video</h2>
                        <p className="text-xs text-muted-foreground mt-1 truncate max-w-[220px]">{url}</p>
                    </div>
                    <div className="w-full space-y-1.5">
                        <Progress value={prog} className="h-2" />
                        <p className="text-xs text-muted-foreground">{Math.round(prog)}%</p>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />{msgs[idx]}…
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

// ─── Collapsible section ──────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, iconColor = "text-primary", children, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <Card>
            <button
                className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors rounded-xl"
                onClick={() => setOpen(o => !o)}
            >
                <span className="flex items-center gap-2 font-semibold text-sm">
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                    {title}
                </span>
                {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
            {open && <CardContent className="pt-0 pb-4 px-4">{children}</CardContent>}
        </Card>
    )
}

// ─── Summary Detail View ──────────────────────────────────────────────────────
const SummaryView = ({ summary, onBack, onDelete }) => {
    const { summary: s } = summary

    return (
        <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-lg truncate">{summary.videoTitle}</h2>
                    <p className="text-xs text-muted-foreground">{summary.channelName}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <a href={summary.videoUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-1.5 text-red-500 border-red-200 hover:bg-red-50">
                            <Youtube className="h-3.5 w-3.5" /> Watch
                        </Button>
                    </a>
                    <Button variant="outline" size="sm" onClick={() => onDelete(summary._id)}
                        className="text-muted-foreground hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Thumbnail + Overview hero */}
            <Card className="overflow-hidden">
                <div className="relative">
                    <img
                        src={summary.thumbnailUrl}
                        alt={summary.videoTitle}
                        className="w-full h-44 object-cover"
                        onError={e => { e.target.style.display = "none" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <a href={summary.videoUrl} target="_blank" rel="noopener noreferrer"
                        className="absolute bottom-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors">
                        <Play className="h-4 w-4 fill-current" />
                    </a>
                </div>
                <CardContent className="pt-4 pb-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">{s.overview}</p>
                </CardContent>
            </Card>

            {/* Key points */}
            <Section title="Key Points" icon={List} iconColor="text-blue-500" defaultOpen>
                <ul className="space-y-2 mt-1">
                    {s.keyPoints?.map((point, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm">
                            <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs flex items-center justify-center font-bold mt-0.5">{i + 1}</span>
                            {point}
                        </li>
                    ))}
                </ul>
            </Section>

            {/* Detailed sections */}
            {s.detailedSections?.length > 0 && (
                <Section title="Section Breakdown" icon={FileText} iconColor="text-violet-500">
                    <div className="space-y-4 mt-1">
                        {s.detailedSections.map((sec, i) => (
                            <div key={i} className="border-l-2 border-violet-200 dark:border-violet-800 pl-4">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-semibold text-sm">{sec.title}</p>
                                    {sec.timestamp && (
                                        <Badge variant="outline" className="text-xs font-mono">
                                            <Clock className="h-2.5 w-2.5 mr-1" />{sec.timestamp}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">{sec.content}</p>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Important terms */}
            {s.importantTerms?.length > 0 && (
                <Section title="Important Terms" icon={Tag} iconColor="text-green-500">
                    <div className="grid sm:grid-cols-2 gap-3 mt-1">
                        {s.importantTerms.map((item, i) => (
                            <div key={i} className="bg-muted/50 rounded-lg p-3">
                                <p className="font-semibold text-sm text-green-600 dark:text-green-400 mb-1">{item.term}</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{item.definition}</p>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Takeaways */}
            {s.takeaways?.length > 0 && (
                <Section title="Key Takeaways" icon={Zap} iconColor="text-yellow-500">
                    <ul className="space-y-2 mt-1">
                        {s.takeaways.map((t, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                                {t}
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {/* Study questions */}
            {s.studyQuestions?.length > 0 && (
                <Section title="Study Questions" icon={HelpCircle} iconColor="text-orange-500">
                    <ol className="space-y-3 mt-1">
                        {s.studyQuestions.map((q, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm">
                                <span className="shrink-0 font-bold text-orange-500">Q{i + 1}.</span>
                                <span className="text-muted-foreground">{q}</span>
                            </li>
                        ))}
                    </ol>
                </Section>
            )}
        </div>
    )
}

// ─── URL Input Form ───────────────────────────────────────────────────────────
const UrlForm = ({ onSummarized }) => {
    const [url, setUrl] = useState("")
    const [isSummarizing, setIsSummarizing] = useState(false)
    const [error, setError] = useState("")

    const isValidYT = (u) => /youtube\.com|youtu\.be/.test(u)

    const handleSubmit = async () => {
        if (!url.trim() || !isValidYT(url)) {
            setError("Please enter a valid YouTube URL")
            return
        }
        setError("")
        setIsSummarizing(true)
        try {
            const res = await axios.post("/api/youtube-summarizer", { videoUrl: url.trim() })
            onSummarized(res.data.summary, res.data.cached)
        } catch (e) {
            setError(e.response?.data?.error || "Failed to summarise. Try another video.")
            console.error(e)
        } finally {
            setIsSummarizing(false)
        }
    }

    return (
        <>
            {isSummarizing && <SummarizingOverlay url={url} />}
            <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                        <Input
                            value={url}
                            onChange={e => { setUrl(e.target.value); setError("") }}
                            onKeyDown={e => e.key === "Enter" && handleSubmit()}
                            placeholder="https://www.youtube.com/watch?v=…"
                            className="pl-9"
                            disabled={isSummarizing}
                        />
                    </div>
                    <Button onClick={handleSubmit} disabled={!url.trim() || isSummarizing} className="gap-2 shrink-0">
                        <Sparkles className="h-4 w-4" /> Summarise
                    </Button>
                </div>
                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                        <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                    </div>
                )}
                <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                    <span className="font-medium">Supports:</span>
                    <span>youtube.com/watch?v=…</span>
                    <span>·</span>
                    <span>youtu.be/…</span>
                    <span>·</span>
                    <span>youtube.com/shorts/…</span>
                </div>
            </div>
        </>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function YoutubeSummarizerPage() {
    const [summaries, setSummaries] = useState([])
    const [activeSummary, setActiveSummary] = useState(null)
    const [view, setView] = useState("list") // "list" | "detail"
    const [isLoading, setIsLoading] = useState(true)
    const [cachedToast, setCachedToast] = useState(false)

    useEffect(() => { fetchSummaries() }, [])

    const fetchSummaries = async () => {
        try {
            const res = await axios.get("/api/youtube-summarizer")
            setSummaries(res.data.summaries || [])
        } catch (e) { console.error(e) }
        finally { setIsLoading(false) }
    }

    const handleSummarized = (summary, cached) => {
        if (cached) setCachedToast(true)
        setActiveSummary(summary)
        setView("detail")
        fetchSummaries()
        setTimeout(() => setCachedToast(false), 3000)
    }

    const openSummary = async (s) => {
        try {
            const res = await axios.get(`/api/youtube-summarizer?summaryId=${s._id}`)
            setActiveSummary(res.data.summary)
            setView("detail")
        } catch (e) { console.error(e) }
    }

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/youtube-summarizer?summaryId=${id}`)
            setSummaries(s => s.filter(x => x._id !== id))
            if (view === "detail") setView("list")
        } catch (e) { console.error(e) }
    }

    if (view === "detail" && activeSummary) return (
        <div className="p-6">
            {cachedToast && (
                <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white text-sm rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
                    <Zap className="h-4 w-4" /> Loaded from cache — already summarised!
                </div>
            )}
            <SummaryView
                summary={activeSummary}
                onBack={() => { setView("list"); setActiveSummary(null) }}
                onDelete={handleDelete}
            />
        </div>
    )

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Youtube className="h-7 w-7 text-red-500" /> YouTube Summariser
                    </h1>
                    <p className="text-muted-foreground mt-1">Paste a video URL and get structured study notes</p>
                </div>
            </div>

            {/* URL input always visible at top */}
            <Card className="border-red-200/50 dark:border-red-900/20 bg-red-50/30 dark:bg-red-900/5">
                <CardContent className="pt-5 pb-5">
                    <UrlForm onSummarized={handleSummarized} />
                </CardContent>
            </Card>

            {/* Stats */}
            {summaries.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-5 pb-5 flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-muted"><Youtube className="h-5 w-5 text-red-500" /></div>
                            <div><p className="text-2xl font-bold">{summaries.length}</p><p className="text-xs text-muted-foreground">Videos Summarised</p></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-5 pb-5 flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-muted"><BookOpen className="h-5 w-5 text-blue-500" /></div>
                            <div><p className="text-2xl font-bold">{summaries.reduce((s, x) => s + (x.summary?.keyPoints?.length || 0), 0)}</p><p className="text-xs text-muted-foreground">Key Points</p></div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* History */}
            {summaries.length > 0 && (
                <div>
                    <h2 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">Previously Summarised</h2>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {summaries.map(s => (
                            <Card key={s._id}
                                className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 group overflow-hidden"
                                onClick={() => openSummary(s)}
                            >
                                <div className="relative h-28 overflow-hidden bg-muted">
                                    <img
                                        src={s.thumbnailUrl}
                                        alt={s.videoTitle}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={e => { e.target.style.display = "none" }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    <div className="absolute bottom-2 left-2 right-2">
                                        <p className="text-white text-xs font-medium truncate">{s.channelName}</p>
                                    </div>
                                    <button
                                        onClick={e => { e.stopPropagation(); handleDelete(s._id) }}
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-red-500/80 rounded-full p-1"
                                    >
                                        <Trash2 className="h-3 w-3 text-white" />
                                    </button>
                                </div>
                                <CardContent className="pt-3 pb-3">
                                    <p className="font-semibold text-sm line-clamp-2 leading-tight">{s.videoTitle}</p>
                                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(s.createdAt).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1"><List className="h-3 w-3" />{s.summary?.keyPoints?.length || 0} points</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {!isLoading && summaries.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Youtube className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No videos summarised yet</p>
                    <p className="text-sm mt-1">Paste a YouTube URL above to get started</p>
                </div>
            )}
        </div>
    )
}