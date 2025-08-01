"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    MessageCircle,
    Send,
    Trash2,
    Bot,
    User,
    Loader2,
    AlertCircle,
    History,
    FileText,
    Sparkles,
    Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function ChatbotPage() {
    const [conversations, setConversations] = useState([])
    const [currentConversation, setCurrentConversation] = useState(null)
    const [messages, setMessages] = useState([])
    const [inputMessage, setInputMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingConversations, setIsLoadingConversations] = useState(true)
    const [isLoadingMessages, setIsLoadingMessages] = useState(false)
    const [showHistory, setShowHistory] = useState(true)
    const messagesEndRef = useRef(null)

    // Fetch conversations on component mount
    useEffect(() => {
        fetchConversations()
    }, [])

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const fetchConversations = async () => {
        try {
            setIsLoadingConversations(true)
            const response = await axios.get("/api/chat")
            console.log("response form chat", response.data)
            setConversations(response.data.conversations || [])

            // Toast for successful load
            if (response.data.conversations && response.data.conversations.length > 0) {
                toast.success(`Loaded ${response.data.conversations.length} conversations`)
            }
        } catch (error) {
            console.error("Failed to fetch conversations:", error)
            toast.error("Failed to load conversations")
        } finally {
            setIsLoadingConversations(false)
        }
    }

    const fetchMessages = async (conversationId) => {
        try {
            setIsLoadingMessages(true)
            toast.loading("Loading conversation...", { id: "loading-messages" })

            const response = await axios.get(`/api/chat/messages?conversationId=${conversationId}`)
            setMessages(response.data.messages || [])

            toast.success("Conversation loaded", { id: "loading-messages" })
        } catch (error) {
            console.error("Failed to fetch messages:", error)
            toast.error("Failed to load messages", { id: "loading-messages" })
        } finally {
            setIsLoadingMessages(false)
        }
    }

    const startNewConversation = async (message) => {
        try {
            setIsLoading(true)
            toast.loading("Starting new conversation...", { id: "new-conversation" })

            const response = await axios.post("/api/chat", {
                message,
                conversationTitle: message.substring(0, 50),
            })

            const { conversationId, userMessage, assistantMessage } = response.data

            // Add new conversation to the list
            const newConversation = {
                conversationId,
                title: message.substring(0, 50),
                messageCount: 2,
                lastActivity: new Date().toISOString(),
                preview: assistantMessage.content.substring(0, 100),
            }

            setConversations((prev) => [newConversation, ...prev])
            setCurrentConversation(conversationId)
            setMessages([userMessage, assistantMessage])

            toast.success("New conversation started!", { id: "new-conversation" })
        } catch (error) {
            console.error("Failed to start conversation:", error)
            toast.error("Failed to start conversation", { id: "new-conversation" })
        } finally {
            setIsLoading(false)
        }
    }

    const sendMessage = async (message) => {
        if (!currentConversation) {
            await startNewConversation(message)
            return
        }

        try {
            setIsLoading(true)

            // Add user message to UI immediately
            const userMessage = {
                _id: `temp-${Date.now()}`,
                role: "user",
                content: message,
                timestamp: new Date().toISOString(),
            }
            setMessages((prev) => [...prev, userMessage])

            const response = await axios.post(`/api/chat/messages?conversationId=${currentConversation}`, {
                message,
                conversationTitle: conversations.find((c) => c.conversationId === currentConversation)?.title,
            })

            // Replace temp message with actual response
            setMessages((prev) => [
                ...prev.slice(0, -1), // Remove temp message
                { ...userMessage, _id: `user-${Date.now()}` }, // Add actual user message
                response.data.assistantMessage,
            ])

            // Update conversation in sidebar
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.conversationId === currentConversation
                        ? {
                            ...conv,
                            messageCount: conv.messageCount + 2,
                            lastActivity: new Date().toISOString(),
                            preview: response.data.assistantMessage.content.substring(0, 100),
                        }
                        : conv,
                ),
            )


        } catch (error) {
            console.error("Failed to send message:", error)
            toast.error("Failed to send message")
            // Remove the temporary message on error
            setMessages((prev) => prev.slice(0, -1))
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!inputMessage.trim() || isLoading) return

        const message = inputMessage.trim()
        setInputMessage("")
        await sendMessage(message)
    }

    const selectConversation = (conversationId) => {
        setCurrentConversation(conversationId)
        fetchMessages(conversationId)

        // Toast for conversation selection
        const selectedConv = conversations.find(c => c.conversationId === conversationId)
        if (selectedConv) {
            toast.info(`Switched to: ${selectedConv.title}`)
        }
    }

    const deleteConversation = async (conversationId) => {
        try {
            toast.loading("Deleting conversation...", { id: "delete-conversation" })

            await axios.delete(`/api/chat/messages?conversationId=${conversationId}`)
            setConversations((prev) => prev.filter((c) => c.conversationId !== conversationId))

            if (currentConversation === conversationId) {
                setCurrentConversation(null)
                setMessages([])
            }

            toast.success("Conversation deleted", { id: "delete-conversation" })
        } catch (error) {
            console.error("Failed to delete conversation:", error)
            toast.error("Failed to delete conversation", { id: "delete-conversation" })
        }
    }

    const startNewChat = () => {
        setCurrentConversation(null)
        setMessages([])
        setInputMessage("")
        toast.info("Started new chat")
    }

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const toggleHistory = () => {
        setShowHistory(!showHistory)
        toast.info(showHistory ? "Conversation history hidden" : "Conversation history shown")
    }

    return (
        <div className="h-[calc(100vh-7rem)] flex">
            {/* Main Chat Area */}
            <div className={cn("flex-1 flex flex-col", showHistory ? "mr-6" : "")}>
                {/* Chat Card with full height */}
                <Card className="h-full flex flex-col">
                    {/* Chat Header - Fixed */}
                    <CardHeader className="flex-shrink-0 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Bot className="size-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Student Assistant</CardTitle>
                                    <CardDescription>
                                        {currentConversation
                                            ? conversations.find((c) => c.conversationId === currentConversation)?.title
                                            : "Ask me any academic question"}
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={startNewChat}
                                    size="sm"
                                    className="flex items-center gap-2 bg-transparent"
                                >
                                    <Plus className="h-4 w-4" />
                                    New Chat
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={toggleHistory}
                                    size="sm"
                                    className="flex items-center gap-2 bg-transparent"
                                >
                                    <History className="h-4 w-4" />
                                    {showHistory ? "Hide Conversation" : "Show Conversation"}
                                    {conversations.length > 0 && (
                                        <Badge variant="secondary" className="ml-1">
                                            {conversations.length}
                                        </Badge>
                                    )}
                                </Button>
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    AI Powered
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>

                    {/* Messages Area - Scrollable */}
                    <div className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full">
                            <div className="p-6">
                                {currentConversation ? (
                                    isLoadingMessages ? (
                                        <div className="flex items-center justify-center h-32">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="space-y-4 max-w-4xl mx-auto">
                                            {messages.map((message) => (
                                                <div
                                                    key={message._id}
                                                    className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                                                >
                                                    {message.role === "assistant" && (
                                                        <Avatar className="h-8 w-8 border">
                                                            <AvatarFallback>
                                                                <Bot className="h-4 w-4" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}

                                                    <div
                                                        className={cn(
                                                            "max-w-[75%] rounded-lg px-4 py-3",
                                                            message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                                                        )}
                                                    >
                                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                                        <p className="text-xs opacity-70 mt-2">{formatTime(message.timestamp)}</p>
                                                    </div>

                                                    {message.role === "user" && (
                                                        <Avatar className="h-8 w-8 border">
                                                            <AvatarFallback>
                                                                <User className="h-4 w-4" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                </div>
                                            ))}

                                            {isLoading && (
                                                <div className="flex gap-3 justify-start">
                                                    <Avatar className="h-8 w-8 border">
                                                        <AvatarFallback>
                                                            <Bot className="h-4 w-4" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="bg-muted rounded-lg px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            <span className="text-sm">Thinking...</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div ref={messagesEndRef} />
                                        </div>
                                    )
                                ) : (
                                    /* Welcome Screen */
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center max-w-md">
                                            <div className="flex aspect-square size-20 items-center justify-center rounded-lg bg-primary text-primary-foreground mx-auto mb-6">
                                                <Bot className="size-10" />
                                            </div>
                                            <h3 className="text-2xl font-semibold mb-3">Welcome to Student Assistant</h3>
                                            <p className="text-muted-foreground text-center mb-8 text-lg">
                                                Ask me any academic question and I'll help you understand the concepts better.
                                            </p>
                                            <div className="grid gap-3 text-muted-foreground">
                                                <div className="flex items-center gap-3 justify-center">
                                                    <AlertCircle className="h-5 w-5" />
                                                    <span>I can help with academic subjects</span>
                                                </div>
                                                <div className="flex items-center gap-3 justify-center">
                                                    <AlertCircle className="h-5 w-5" />
                                                    <span>Ask questions in any subject area</span>
                                                </div>
                                                <div className="flex items-center gap-3 justify-center">
                                                    <AlertCircle className="h-5 w-5" />
                                                    <span>Get detailed explanations and examples</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Fixed Input Area at Bottom */}
                    <div className="flex-shrink-0 border-t bg-background p-6">
                        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                            <div className="flex gap-3">
                                <Input
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Ask me any academic question..."
                                    disabled={isLoading}
                                    className="flex-1 h-12 text-base"
                                />
                                <Button type="submit" disabled={!inputMessage.trim() || isLoading} size="lg" className="px-6">
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>
            </div>

            {/* Conversations History Sidebar */}
            {showHistory && (
                <div className="w-80 flex-shrink-0">
                    <Card className="h-full flex flex-col">
                        <CardHeader className="flex-shrink-0">
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5" />
                                Conversations
                            </CardTitle>
                            <CardDescription>{conversations.length} saved</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-hidden">
                            <ScrollArea className="h-full">
                                {isLoadingConversations ? (
                                    <div className="p-4 space-y-3">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="animate-pulse">
                                                <div className="h-16 bg-muted rounded-lg"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : conversations.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground">
                                        <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p className="text-sm">No conversations yet</p>
                                        <p className="text-xs mt-1">Start chatting to see your history</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1 p-2">
                                        {conversations.map((conversation, index) => (
                                            <div key={conversation.conversationId} className="group">
                                                <div
                                                    className={cn(
                                                        "p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent",
                                                        currentConversation === conversation.conversationId && "bg-accent",
                                                    )}
                                                    onClick={() => selectConversation(conversation.conversationId)}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-medium truncate">{conversation.title}</h4>
                                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{conversation.preview}</p>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <p className="text-xs text-muted-foreground">{formatTime(conversation.lastActivity)}</p>
                                                                <Badge variant="outline" className="text-xs px-1 py-0">
                                                                    <FileText className="h-3 w-3 mr-1" />
                                                                    {conversation.messageCount}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                deleteConversation(conversation.conversationId)
                                                            }}
                                                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                {index < conversations.length - 1 && <Separator className="my-1" />}
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
    )
}