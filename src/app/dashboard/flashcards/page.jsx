"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
    Plus, Brain, Layers, CheckCircle, Clock, RotateCcw,
    Trash2, Play, ChevronLeft, ChevronRight, Eye, Sparkles,
    BookOpen, TrendingUp, X, Loader2, FlipHorizontal, Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// ─── Generating Overlay ───────────────────────────────────────────────────────
const GeneratingOverlay = ({ topic }) => {
    const messages = ["Analysing your notes", "Crafting questions", "Writing answers", "Optimising cards", "Almost ready"]
    const [idx, setIdx] = useState(0)
    const [progress, setProgress] = useState(0)
    useEffect(() => {
        const m = setInterval(() => setIdx(p => (p + 1) % messages.length), 1800)
        const p = setInterval(() => setProgress(p => Math.min(p + Math.random() * 7, 88)), 600)
        return () => { clearInterval(m); clearInterval(p) }
    }, [])
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Card className="w-full max-w-sm mx-4 shadow-2xl border-2 border-primary/20">
                <CardContent className="pt-10 pb-10 flex flex-col items-center gap-5 text-center">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                        <div className="relative p-5 rounded-full bg-primary/10">
                            <Brain className="h-10 w-10 text-primary animate-pulse" />
                        </div>
                        <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-400 animate-spin" style={{ animationDuration: "3s" }} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Creating Flashcards</h2>
                        <p className="text-sm text-muted-foreground mt-1">on <span className="font-semibold text-foreground">"{topic}"</span></p>
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

// ─── Flip Card Component ──────────────────────────────────────────────────────
const FlipCard = ({ card, isFlipped, onFlip }) => (
    <div className="perspective-1000 w-full cursor-pointer" onClick={onFlip} style={{ perspective: "1000px" }}>
        <div
            className="relative w-full transition-transform duration-500"
            style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                minHeight: "260px",
            }}
        >
            {/* Front */}
            <div
                className="absolute inset-0 flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-primary/20 bg-card shadow-lg"
                style={{ backfaceVisibility: "hidden" }}
            >
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Question</p>
                <p className="text-xl font-medium text-center leading-relaxed">{card.front}</p>
                <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                    <FlipHorizontal className="h-3 w-3" />
                    Click to reveal answer
                </div>
            </div>
            {/* Back */}
            <div
                className="absolute inset-0 flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-green-500/30 bg-green-50/5 shadow-lg"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
                <p className="text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">Answer</p>
                <p className="text-xl font-medium text-center leading-relaxed">{card.back}</p>
            </div>
        </div>
    </div>
)

// ─── Status badge helper ──────────────────────────────────────────────────────
const statusConfig = {
    new:      { label: "New",      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    learning: { label: "Learning", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    review:   { label: "Review",   color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    mastered: { label: "Mastered", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
}

// ─── Study Session ────────────────────────────────────────────────────────────
const StudySession = ({ deck, onExit, onDeckUpdate }) => {
    const studyCards = deck.cards.filter(c => {
        if (c.status === "mastered") return false
        return new Date(c.nextReviewDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
    })

    const [cardIndex, setCardIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [sessionDone, setSessionDone] = useState(studyCards.length === 0)
    const [reviewed, setReviewed] = useState(0)

    const currentCard = studyCards[cardIndex]

    const handleRate = async (quality) => {
        // quality: 1=again, 3=hard, 4=good, 5=easy
        try {
            await axios.patch("/api/flashcards", {
                deckId: deck._id,
                cardId: currentCard._id,
                quality,
            })
        } catch (e) { console.error(e) }

        const next = cardIndex + 1
        if (next >= studyCards.length) {
            setSessionDone(true)
            onDeckUpdate()
        } else {
            setCardIndex(next)
            setIsFlipped(false)
            setReviewed(r => r + 1)
        }
    }

    if (sessionDone) return (
        <div className="max-w-lg mx-auto text-center space-y-6 py-16">
            <div className="p-6 rounded-full bg-green-100 dark:bg-green-900/20 w-24 h-24 flex items-center justify-center mx-auto">
                <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <div>
                <h2 className="text-2xl font-bold">Session Complete!</h2>
                <p className="text-muted-foreground mt-1">
                    {studyCards.length === 0
                        ? "All cards are up to date. Come back tomorrow!"
                        : `You reviewed ${studyCards.length} cards. Great work!`}
                </p>
            </div>
            <Button onClick={onExit} size="lg">Back to Decks</Button>
        </div>
    )

    const progress = (cardIndex / studyCards.length) * 100

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={onExit}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Exit
                </Button>
                <div className="text-center">
                    <p className="text-sm font-medium">{deck.deckName}</p>
                    <p className="text-xs text-muted-foreground">{cardIndex + 1} / {studyCards.length}</p>
                </div>
                <Badge className={statusConfig[currentCard.status]?.color}>
                    {statusConfig[currentCard.status]?.label}
                </Badge>
            </div>

            <Progress value={progress} className="h-1.5" />

            <FlipCard card={currentCard} isFlipped={isFlipped} onFlip={() => setIsFlipped(f => !f)} />

            {isFlipped && (
                <div className="grid grid-cols-4 gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex flex-col h-16 gap-0.5" onClick={() => handleRate(1)}>
                        <RotateCcw className="h-4 w-4" />
                        <span className="text-xs">Again</span>
                    </Button>
                    <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex flex-col h-16 gap-0.5" onClick={() => handleRate(3)}>
                        <Clock className="h-4 w-4" />
                        <span className="text-xs">Hard</span>
                    </Button>
                    <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex flex-col h-16 gap-0.5" onClick={() => handleRate(4)}>
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs">Good</span>
                    </Button>
                    <Button variant="outline" className="border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 flex flex-col h-16 gap-0.5" onClick={() => handleRate(5)}>
                        <Star className="h-4 w-4" />
                        <span className="text-xs">Easy</span>
                    </Button>
                </div>
            )}
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FlashcardsPage() {
    const [decks, setDecks] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isGenerating, setIsGenerating] = useState(false)
    const [studyingDeck, setStudyingDeck] = useState(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [generateForm, setGenerateForm] = useState({
        notes: "",
        topic: "",
        deckName: "",
        cardCount: "10",
    })

    useEffect(() => { fetchDecks() }, [])

    const fetchDecks = async () => {
        try {
            const res = await axios.get("/api/flashcards")
            setDecks(res.data.decks || [])
        } catch (e) { console.error(e) }
        finally { setIsLoading(false) }
    }

    const handleGenerate = async () => {
        if (!generateForm.notes.trim() || !generateForm.topic.trim()) return
        setIsGenerating(true)
        setIsDialogOpen(false)
        try {
            await axios.post("/api/flashcards", {
                ...generateForm,
                cardCount: parseInt(generateForm.cardCount),
            })
            await fetchDecks()
        } catch (e) { console.error(e) }
        finally { setIsGenerating(false) }
    }

    const handleDelete = async (deckId) => {
        try {
            await axios.delete(`/api/flashcards?deckId=${deckId}`)
            setDecks(d => d.filter(deck => deck._id !== deckId))
        } catch (e) { console.error(e) }
    }

    const totalCards   = decks.reduce((s, d) => s + d.totalCards, 0)
    const masteredCards = decks.reduce((s, d) => s + d.masteredCards, 0)
    const dueCards = decks.reduce((s, d) => {
        return s + d.cards?.filter(c => c.status !== "mastered" && new Date(c.nextReviewDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000)).length || 0
    }, 0)

    if (studyingDeck) return (
        <div className="p-6">
            <StudySession
                deck={studyingDeck}
                onExit={() => setStudyingDeck(null)}
                onDeckUpdate={fetchDecks}
            />
        </div>
    )

    return (
        <div className="space-y-6 p-6">
            {isGenerating && <GeneratingOverlay topic={generateForm.topic} />}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Layers className="h-7 w-7 text-primary" /> Flashcards
                    </h1>
                    <p className="text-muted-foreground mt-1">AI-generated spaced repetition study cards</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> New Deck
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Generate Flashcard Deck</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <div>
                                <Label>Topic</Label>
                                <Input
                                    placeholder="e.g. Photosynthesis, World War II…"
                                    value={generateForm.topic}
                                    onChange={e => setGenerateForm(p => ({ ...p, topic: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label>Deck Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
                                <Input
                                    placeholder="Leave blank to auto-generate"
                                    value={generateForm.deckName}
                                    onChange={e => setGenerateForm(p => ({ ...p, deckName: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label>Paste Your Notes</Label>
                                <Textarea
                                    placeholder="Paste your lecture notes, textbook excerpts or bullet points here…"
                                    className="min-h-[140px] resize-none"
                                    value={generateForm.notes}
                                    onChange={e => setGenerateForm(p => ({ ...p, notes: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label>Number of Cards</Label>
                                <Select value={generateForm.cardCount} onValueChange={v => setGenerateForm(p => ({ ...p, cardCount: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {["5","10","15","20","25"].map(n => (
                                            <SelectItem key={n} value={n}>{n} cards</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button
                                    onClick={handleGenerate}
                                    disabled={!generateForm.notes.trim() || !generateForm.topic.trim()}
                                >
                                    <Sparkles className="h-4 w-4 mr-2" /> Generate
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Total Cards", value: totalCards, icon: BookOpen, color: "text-blue-500" },
                    { label: "Mastered", value: masteredCards, icon: CheckCircle, color: "text-green-500" },
                    { label: "Due Today", value: dueCards, icon: Clock, color: "text-orange-500" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <Card key={label}>
                        <CardContent className="pt-5 pb-5 flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl bg-muted`}>
                                <Icon className={`h-5 w-5 ${color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{value}</p>
                                <p className="text-xs text-muted-foreground">{label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Deck grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : decks.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="py-16 text-center text-muted-foreground">
                        <Layers className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="font-medium">No decks yet</p>
                        <p className="text-sm mt-1">Paste your notes and generate your first deck</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {decks.map(deck => {
                        const masteredPct = deck.totalCards > 0 ? Math.round((deck.masteredCards / deck.totalCards) * 100) : 0
                        const due = deck.cards?.filter(c =>
                            c.status !== "mastered" &&
                            new Date(c.nextReviewDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
                        ).length || 0

                        return (
                            <Card key={deck._id} className="hover:shadow-md transition-all hover:-translate-y-0.5">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-base truncate">{deck.deckName}</CardTitle>
                                            <CardDescription className="text-xs mt-0.5">{deck.topic}</CardDescription>
                                        </div>
                                        {due > 0 && (
                                            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 ml-2 shrink-0">
                                                {due} due
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Mastery</span>
                                            <span>{masteredPct}%</span>
                                        </div>
                                        <Progress value={masteredPct} className="h-1.5" />
                                    </div>
                                    <div className="flex gap-1.5 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-0.5"><Brain className="h-3 w-3" />{deck.totalCards} cards</span>
                                        <span>·</span>
                                        <span className="flex items-center gap-0.5"><CheckCircle className="h-3 w-3 text-green-500" />{deck.masteredCards} mastered</span>
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <Button size="sm" className="flex-1" onClick={() => setStudyingDeck(deck)}>
                                            <Play className="h-3 w-3 mr-1" /> Study
                                        </Button>
                                        <Button
                                            size="sm" variant="outline"
                                            className="text-red-500 hover:text-red-600 hover:border-red-300"
                                            onClick={() => handleDelete(deck._id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}