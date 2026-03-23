"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
    FileText, Star, TrendingUp, CheckCircle, AlertTriangle,
    ChevronDown, ChevronUp, Trash2, Loader2, Sparkles,
    BookOpen, PenLine, BarChart3, Lightbulb, MessageSquare,
    ArrowLeft, Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// ─── Grading Overlay ──────────────────────────────────────────────────────────
const GradingOverlay = () => {
    const messages = ["Reading your essay", "Analysing structure", "Checking grammar", "Evaluating arguments", "Scoring clarity", "Writing feedback"]
    const [idx, setIdx] = useState(0)
    const [progress, setProgress] = useState(0)
    useEffect(() => {
        const m = setInterval(() => setIdx(p => (p + 1) % messages.length), 2000)
        const p = setInterval(() => setProgress(p => Math.min(p + Math.random() * 5, 90)), 700)
        return () => { clearInterval(m); clearInterval(p) }
    }, [])
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Card className="w-full max-w-sm mx-4 shadow-2xl border-2 border-primary/20">
                <CardContent className="pt-10 pb-10 flex flex-col items-center gap-5 text-center">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                        <div className="relative p-5 rounded-full bg-primary/10">
                            <PenLine className="h-10 w-10 text-primary animate-pulse" />
                        </div>
                        <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-400 animate-spin" style={{ animationDuration: "3s" }} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Grading Your Essay</h2>
                        <p className="text-sm text-muted-foreground mt-1">AI is analysing your writing…</p>
                    </div>
                    <div className="w-full space-y-1.5">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {messages[idx]}…
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
const ScoreRing = ({ score, size = 120 }) => {
    const r = 45
    const circ = 2 * Math.PI * r
    const dash = (score / 100) * circ
    const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444"
    return (
        <svg width={size} height={size} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
            <circle
                cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
                strokeDasharray={`${dash} ${circ}`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{ transition: "stroke-dasharray 1s ease" }}
            />
            <text x="50" y="46" textAnchor="middle" fontSize="18" fontWeight="700" fill={color}>{score}</text>
            <text x="50" y="60" textAnchor="middle" fontSize="9" fill="currentColor" className="fill-muted-foreground">/ 100</text>
        </svg>
    )
}

// ─── Criteria bar ─────────────────────────────────────────────────────────────
const CriteriaBar = ({ label, score, max = 10, icon: Icon, detail }) => {
    const [expanded, setExpanded] = useState(false)
    const pct = (score / max) * 100
    const color = pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-yellow-500" : "bg-red-500"
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <button
                    className="flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors"
                    onClick={() => detail && setExpanded(e => !e)}
                >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {label}
                    {detail && (expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                </button>
                <span className="text-sm font-bold tabular-nums">{score}<span className="text-muted-foreground font-normal">/{max}</span></span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
            </div>
            {expanded && detail && (
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    {detail}
                </p>
            )}
        </div>
    )
}

// ─── Grade badge ──────────────────────────────────────────────────────────────
const gradeColor = (g) => {
    if (!g) return ""
    if (g.startsWith("A")) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    if (g.startsWith("B")) return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
    if (g.startsWith("C")) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
}

// ─── Result View ──────────────────────────────────────────────────────────────
const EssayResult = ({ essay, onBack }) => {
    const { feedback } = essay
    const criteria = [
        { key: "structure", label: "Structure", icon: BarChart3 },
        { key: "grammar", label: "Grammar", icon: BookOpen },
        { key: "argumentStrength", label: "Argument Strength", icon: TrendingUp },
        { key: "clarity", label: "Clarity", icon: MessageSquare },
        { key: "vocabulary", label: "Vocabulary", icon: PenLine },
        { key: "creativity", label: "Creativity", icon: Lightbulb },
    ]

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <div>
                    <h2 className="text-xl font-bold">{essay.title}</h2>
                    <p className="text-xs text-muted-foreground">{essay.wordCount} words · {essay.essayType}</p>
                </div>
            </div>

            {/* Score hero */}
            <Card className="overflow-hidden">
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6">
                    <div className="flex items-center gap-6">
                        <ScoreRing score={feedback.overallScore} size={110} />
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                                <Badge className={`text-lg px-3 py-1 font-bold ${gradeColor(feedback.grade)}`}>
                                    {feedback.grade}
                                </Badge>
                                <span className="text-sm text-muted-foreground">Overall Grade</span>
                            </div>
                            <p className="text-sm leading-relaxed text-muted-foreground">{feedback.summary}</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Criteria breakdown */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Detailed Scores</CardTitle>
                    <CardDescription className="text-xs">Click a category to see detailed feedback</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {criteria.map(({ key, label, icon }) => (
                        <CriteriaBar
                            key={key}
                            label={label}
                            score={feedback.scores[key]}
                            icon={icon}
                            detail={feedback.detailedFeedback?.[key]}
                        />
                    ))}
                </CardContent>
            </Card>

            {/* Strengths & Improvements */}
            <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-green-200 dark:border-green-900/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-1.5 text-green-600">
                            <CheckCircle className="h-4 w-4" /> Strengths
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {feedback.strengths?.map((s, i) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5 shrink-0">✓</span> {s}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
                <Card className="border-orange-200 dark:border-orange-900/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-1.5 text-orange-600">
                            <AlertTriangle className="h-4 w-4" /> Areas to Improve
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {feedback.improvements?.map((s, i) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                    <span className="text-orange-500 mt-0.5 shrink-0">→</span> {s}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Action suggestions */}
            <Card className="border-primary/20">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                        <Lightbulb className="h-4 w-4 text-yellow-500" /> Actionable Suggestions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ol className="space-y-2">
                        {feedback.suggestions?.map((s, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                                <span className="font-bold text-primary shrink-0">{i + 1}.</span> {s}
                            </li>
                        ))}
                    </ol>
                </CardContent>
            </Card>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EssayGraderPage() {
    const [essays, setEssays] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isGrading, setIsGrading] = useState(false)
    const [activeEssay, setActiveEssay] = useState(null)
    const [view, setView] = useState("list") // "list" | "write" | "result"
    const [form, setForm] = useState({ title: "", essayText: "", essayType: "academic" })

    useEffect(() => { fetchEssays() }, [])
    
    const fetchEssays = async () => {
        try {
            console.log("called")
            const res = await axios.get("/api/essay-grader")
            
            setEssays(res.data.essays || [])
            
        } catch (e) {"error here", console.error(e) }
        finally { setIsLoading(false) }
    }

    const handleGrade = async () => {
        if (!form.title.trim() || !form.essayText.trim()) return
        setIsGrading(true)
        try {
            const res = await axios.post("/api/essay-grader", form)
            setActiveEssay(res.data.essay)
            setView("result")
            await fetchEssays()
        } catch (e) { console.error(e) }
        finally { setIsGrading(false) }
    }

    const handleDelete = async (id, e) => {
        e.stopPropagation()
        try {
            await axios.delete(`/api/essay-grader?essayId=${id}`)
            setEssays(es => es.filter(e => e._id !== id))
        } catch (e) { console.error(e) }
    }

    const openEssay = async (essay) => {
        try {
            const res = await axios.get(`/api/essay-grader?essayId=${essay._id}`)
            setActiveEssay(res.data.essay)
            setView("result")
        } catch (e) { console.error(e) }
    }

    const wordCount = form.essayText.trim() ? form.essayText.trim().split(/\s+/).length : 0

    if (view === "result" && activeEssay) return (
        <div className="p-6">
            {isGrading && <GradingOverlay />}
            <EssayResult essay={activeEssay} onBack={() => { setView("list"); setActiveEssay(null) }} />
        </div>
    )

    if (view === "write") return (
        <div className="p-6 max-w-3xl mx-auto space-y-5">
            {isGrading && <GradingOverlay />}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setView("list")}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <h2 className="text-xl font-bold">Submit Essay for Grading</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Essay Title</Label>
                    <Input
                        placeholder="My essay title…"
                        value={form.title}
                        onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    />
                </div>
                <div className="space-y-1.5">
                    <Label>Essay Type</Label>
                    <Select value={form.essayType} onValueChange={v => setForm(p => ({ ...p, essayType: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {["academic","creative","argumentative","narrative","descriptive","expository"].map(t => (
                                <SelectItem key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                    <Label>Your Essay</Label>
                    <span className="text-xs text-muted-foreground tabular-nums">{wordCount} words</span>
                </div>
                <Textarea
                    placeholder="Paste or type your essay here…"
                    className="min-h-[380px] resize-none font-serif text-base leading-relaxed"
                    value={form.essayText}
                    onChange={e => setForm(p => ({ ...p, essayText: e.target.value }))}
                />
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setView("list")}>Cancel</Button>
                <Button
                    onClick={handleGrade}
                    disabled={!form.title.trim() || wordCount < 30 || isGrading}
                >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {wordCount < 30 ? "Write at least 30 words" : "Grade My Essay"}
                </Button>
            </div>
        </div>
    )

    // ─── List view ─────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <PenLine className="h-7 w-7 text-primary" /> Essay Grader
                    </h1>
                    <p className="text-muted-foreground mt-1">Get AI-powered feedback on your writing</p>
                </div>
                <Button onClick={() => { setForm({ title: "", essayText: "", essayType: "academic" }); setView("write") }} className="gap-2">
                    <FileText className="h-4 w-4" /> Grade New Essay
                </Button>
            </div>

            {/* Summary stats */}
            {essays.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-5 pb-5 flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-muted"><FileText className="h-5 w-5 text-blue-500" /></div>
                            <div><p className="text-2xl font-bold">{essays.length}</p><p className="text-xs text-muted-foreground">Essays Graded</p></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-5 pb-5 flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-muted"><Star className="h-5 w-5 text-yellow-500" /></div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {Math.round(essays.reduce((s, e) => s + (e.feedback?.overallScore || 0), 0) / essays.length)}%
                                </p>
                                <p className="text-xs text-muted-foreground">Avg Score</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-5 pb-5 flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-muted"><TrendingUp className="h-5 w-5 text-green-500" /></div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {essays.filter(e => (e.feedback?.overallScore || 0) >= 80).length}
                                </p>
                                <p className="text-xs text-muted-foreground">A-Grade Essays</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : essays.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="py-16 text-center text-muted-foreground">
                        <PenLine className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="font-medium">No essays graded yet</p>
                        <p className="text-sm mt-1">Submit your first essay to get detailed AI feedback</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {essays.map(essay => (
                        <Card
                            key={essay._id}
                            className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5"
                            onClick={() => openEssay(essay)}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-base truncate">{essay.title}</CardTitle>
                                        <CardDescription className="text-xs capitalize mt-0.5">{essay.essayType}</CardDescription>
                                    </div>
                                    <Badge className={`shrink-0 font-bold ${gradeColor(essay.feedback?.grade)}`}>
                                        {essay.feedback?.grade}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Score</span>
                                        <span className="font-medium">{essay.feedback?.overallScore}/100</span>
                                    </div>
                                    <Progress value={essay.feedback?.overallScore} className="h-1.5" />
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(essay.createdAt).toLocaleDateString()}</span>
                                    <Button
                                        variant="ghost" size="sm"
                                        className="h-6 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        onClick={e => handleDelete(essay._id, e)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}