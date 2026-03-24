"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import axios from "axios"
import {
    Upload, FileText, MessageSquare, Send, Trash2, Loader2,
    ArrowLeft, Bot, User, File, X, BookOpen, Sparkles,
    AlertCircle, ChevronRight, Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

// ─── Suggested questions ──────────────────────────────────────────────────────
const SUGGESTED = [
    "Summarise this document in 5 bullet points",
    "What are the main topics covered?",
    "Explain the key concepts simply",
    "What are the most important takeaways?",
    "Create 5 study questions from this",
]

// ─── Processing overlay ───────────────────────────────────────────────────────
const ProcessingOverlay = ({ fileName }) => {
    const msgs = ["Reading your PDF", "Extracting text", "Understanding content", "Preparing chat"]
    const [idx, setIdx] = useState(0)
    const [prog, setProg] = useState(0)
    useEffect(() => {
        const m = setInterval(() => setIdx(p => (p + 1) % msgs.length), 1800)
        const p = setInterval(() => setProg(p => Math.min(p + Math.random() * 8, 90)), 600)
        return () => { clearInterval(m); clearInterval(p) }
    }, [])
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Card className="w-full max-w-sm mx-4 shadow-2xl border-2 border-primary/20">
                <CardContent className="pt-10 pb-10 flex flex-col items-center gap-5 text-center">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                        <div className="relative p-5 rounded-full bg-primary/10">
                            <FileText className="h-10 w-10 text-primary animate-pulse" />
                        </div>
                        <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-400 animate-spin" style={{ animationDuration: "3s" }} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Processing PDF</h2>
                        <p className="text-sm text-muted-foreground mt-1 truncate max-w-[200px]">{fileName}</p>
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

// ─── Chat message bubble ──────────────────────────────────────────────────────
const MessageBubble = ({ msg }) => {
    const isUser = msg.role === "user"
    return (
        <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold
                ${isUser ? "bg-primary" : "bg-muted border"}`}>
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-foreground" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                ${isUser
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted rounded-tl-sm"
                }`}>
                {msg.content}
            </div>
        </div>
    )
}

// ─── Chat View ────────────────────────────────────────────────────────────────
const ChatView = ({ session, onBack, onSessionUpdate }) => {
    const [messages, setMessages] = useState(session.messages || [])
    const [input, setInput] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [error, setError] = useState("")
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const sendMessage = async (text) => {
        const msg = text || input.trim()
        if (!msg || isSending) return

        setInput("")
        setError("")
        setMessages(prev => [...prev, { role: "user", content: msg, timestamp: new Date() }])
        setIsSending(true)

        try {
            const res = await axios.post("/api/pdf-chat", {
                action: "message",
                sessionId: session._id,
                userMessage: msg,
            })
            setMessages(prev => [...prev, { role: "assistant", content: res.data.reply, timestamp: new Date() }])
        } catch (e) {
            setError("Failed to get response. Please try again.")
            console.error(e)
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b shrink-0">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/20">
                        <FileText className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{session.title}</p>
                        <p className="text-xs text-muted-foreground">{session.fileName}</p>
                    </div>
                </div>
                <Badge variant="outline" className="shrink-0 text-xs">
                    {messages.length} messages
                </Badge>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 px-1">
                {messages.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <Bot className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Ask anything about your document</p>
                    </div>
                )}
                {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
                {isSending && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted border flex items-center justify-center">
                            <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                            <div className="flex gap-1 items-center h-5">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                                        style={{ animationDelay: `${i * 0.15}s` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                        <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Suggested prompts — show only at start */}
            {messages.length <= 1 && (
                <div className="flex gap-2 flex-wrap pb-3 shrink-0">
                    {SUGGESTED.map((s, i) => (
                        <button key={i}
                            onClick={() => sendMessage(s)}
                            className="text-xs bg-muted hover:bg-muted/70 rounded-full px-3 py-1.5 text-left transition-colors"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="flex gap-2 shrink-0 pt-2 border-t">
                <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Ask anything about your PDF…"
                    disabled={isSending}
                    className="flex-1"
                />
                <Button onClick={() => sendMessage()} disabled={!input.trim() || isSending} size="icon">
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────
const UploadZone = ({ onUploaded }) => {
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState(null)
    const [title, setTitle] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState("")
    const inputRef = useRef(null)

    const handleFile = (f) => {
        if (!f) return
        if (f.type !== "application/pdf") { setError("Only PDF files are supported."); return }
        if (f.size > 10 * 1024 * 1024) { setError("File must be under 10MB."); return }
        setError("")
        setFile(f)
        setTitle(f.name.replace(".pdf", ""))
    }

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFile(e.dataTransfer.files[0])
    }, [])

    const handleUpload = async () => {
        if (!file) return
        setIsProcessing(true)
        setError("")

        try {
            // Convert to base64
            const base64 = await new Promise((res, rej) => {
                const reader = new FileReader()
                reader.onload = () => res(reader.result.split(",")[1])
                reader.onerror = () => rej(new Error("Read failed"))
                reader.readAsDataURL(file)
            })

            const response = await axios.post("/api/pdf-chat", {
                action: "upload",
                base64,
                fileName: file.name,
                fileSize: file.size,
                title: title || file.name.replace(".pdf", ""),
            })

            onUploaded(response.data.session)
        } catch (e) {
            setError(e.response?.data?.error || "Upload failed. Please try again.")
            console.error(e)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <>
            {isProcessing && <ProcessingOverlay fileName={file?.name} />}
            <div className="max-w-xl mx-auto space-y-5">
                <div
                    onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => !file && inputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
                        ${isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"}
                        ${file ? "cursor-default" : ""}`}
                >
                    <input ref={inputRef} type="file" accept=".pdf" className="hidden"
                        onChange={e => handleFile(e.target.files[0])} />

                    {file ? (
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-xl px-4 py-2">
                                <FileText className="h-5 w-5" />
                                <span className="font-medium text-sm truncate max-w-[200px]">{file.name}</span>
                                <button onClick={(e) => { e.stopPropagation(); setFile(null); setTitle("") }}
                                    className="text-red-400 hover:text-red-600 ml-1">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 rounded-full bg-muted w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Upload className="h-7 w-7 text-muted-foreground" />
                            </div>
                            <p className="font-semibold mb-1">Drop your PDF here</p>
                            <p className="text-sm text-muted-foreground">or click to browse · Max 10MB</p>
                        </>
                    )}
                </div>

                {file && (
                    <div className="space-y-1.5">
                        <Label>Chat Title</Label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Give this document a name…" />
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                        <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                    </div>
                )}

                {file && (
                    <Button className="w-full gap-2" onClick={handleUpload} disabled={isProcessing}>
                        <Sparkles className="h-4 w-4" /> Process & Start Chatting
                    </Button>
                )}
            </div>
        </>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PdfChatPage() {
    const [sessions, setSessions] = useState([])
    const [activeSession, setActiveSession] = useState(null)
    const [view, setView] = useState("list") // "list" | "upload" | "chat"
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => { fetchSessions() }, [])

    const fetchSessions = async () => {
        try {
            const res = await axios.get("/api/pdf-chat")
            setSessions(res.data.sessions || [])
        } catch (e) { console.error(e) }
        finally { setIsLoading(false) }
    }

    const openSession = async (session) => {
        try {
            const res = await axios.get(`/api/pdf-chat?sessionId=${session._id}`)
            setActiveSession(res.data.session)
            setView("chat")
        } catch (e) { console.error(e) }
    }

    const handleDelete = async (id, e) => {
        e.stopPropagation()
        try {
            await axios.delete(`/api/pdf-chat?sessionId=${id}`)
            setSessions(s => s.filter(x => x._id !== id))
        } catch (e) { console.error(e) }
    }

    const handleUploaded = (session) => {
        setActiveSession(session)
        setView("chat")
        fetchSessions()
    }

    if (view === "chat" && activeSession) return (
        <div className="p-6">
            <ChatView
                session={activeSession}
                onBack={() => { setView("list"); setActiveSession(null) }}
                onSessionUpdate={fetchSessions}
            />
        </div>
    )

    if (view === "upload") return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setView("list")}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <h2 className="text-xl font-bold">Upload PDF</h2>
            </div>
            <UploadZone onUploaded={handleUploaded} />
        </div>
    )

    // ─── List view ─────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <MessageSquare className="h-7 w-7 text-primary" /> PDF Chat
                    </h1>
                    <p className="text-muted-foreground mt-1">Upload any PDF and chat with it using AI</p>
                </div>
                <Button onClick={() => setView("upload")} className="gap-2">
                    <Upload className="h-4 w-4" /> Upload PDF
                </Button>
            </div>

            {/* Stats */}
            {sessions.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-5 pb-5 flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-muted"><FileText className="h-5 w-5 text-red-500" /></div>
                            <div><p className="text-2xl font-bold">{sessions.length}</p><p className="text-xs text-muted-foreground">Documents</p></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-5 pb-5 flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-muted"><MessageSquare className="h-5 w-5 text-blue-500" /></div>
                            <div><p className="text-2xl font-bold">{sessions.reduce((s, x) => s + (x.messageCount || 0), 0)}</p><p className="text-xs text-muted-foreground">Total Chats</p></div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : sessions.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="py-20 text-center">
                        <div className="p-4 rounded-full bg-muted w-20 h-20 flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-9 w-9 text-muted-foreground opacity-50" />
                        </div>
                        <p className="font-semibold text-lg">No documents yet</p>
                        <p className="text-sm text-muted-foreground mt-1 mb-6">Upload a PDF to start chatting with it</p>
                        <Button onClick={() => setView("upload")} variant="outline" className="gap-2">
                            <Upload className="h-4 w-4" /> Upload your first PDF
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {sessions.map(session => (
                        <Card key={session._id}
                            className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 group"
                            onClick={() => openSession(session)}
                        >
                            <CardContent className="pt-4 pb-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/20 shrink-0">
                                        <FileText className="h-5 w-5 text-red-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">{session.title}</p>
                                        <p className="text-xs text-muted-foreground truncate mt-0.5">{session.fileName}</p>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {new Date(session.updatedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <button
                                            onClick={e => handleDelete(session._id, e)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}