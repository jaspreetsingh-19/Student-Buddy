"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Plus, Map, Calendar, Target, Trash2, Eye, Clock } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function RoadmapPage() {
    const [roadmaps, setRoadmaps] = useState([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedRoadmap, setSelectedRoadmap] = useState(null)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        goal: "",
        duration: "",
    })

    const durationOptions = [
        { value: "1 week", label: "1 Week" },
        { value: "2 weeks", label: "2 Weeks" },
        { value: "1 month", label: "1 Month" },
        { value: "2 months", label: "2 Months" },
        { value: "3 months", label: "3 Months" },
        { value: "6 months", label: "6 Months" },
        { value: "1 year", label: "1 Year" },
        { value: "2 year", label: "2 Year" },
    ]

    // Fetch roadmaps
    const fetchRoadmaps = async () => {
        try {
            setLoading(true)
            const response = await axios.get("/api/roadmap")
            setRoadmaps(response.data.roadmaps)

            // Toast for successful load
            if (response.data.roadmaps && response.data.roadmaps.length > 0) {
                toast.success(`Loaded ${response.data.roadmaps.length} roadmaps`)
            }
        } catch (error) {
            console.error("Failed to fetch roadmaps:", error)
            toast.error("Failed to load roadmaps")
        } finally {
            setLoading(false)
        }
    }

    // Create roadmap
    const handleCreateRoadmap = async (e) => {
        e.preventDefault()
        if (!formData.title || !formData.goal || !formData.duration) return

        try {
            setCreating(true)
            toast.loading("Generating roadmap...", { id: "create-roadmap" })

            const response = await axios.post("/api/roadmap", formData)
            setRoadmaps([response.data.roadmap, ...roadmaps])
            setFormData({ title: "", goal: "", duration: "" })
            setDialogOpen(false)

            toast.success(`Roadmap "${formData.title}" created successfully!`, { id: "create-roadmap" })
        } catch (error) {
            console.error("Failed to create roadmap:", error)
            toast.error("Failed to create roadmap", { id: "create-roadmap" })
        } finally {
            setCreating(false)
        }
    }

    // Delete roadmap
    const handleDeleteRoadmap = async (roadmapId) => {
        try {
            toast.loading("Deleting roadmap...", { id: "delete-roadmap" })

            await axios.delete(`/api/roadmap/${roadmapId}`)
            const deletedRoadmap = roadmaps.find(r => r._id === roadmapId)
            setRoadmaps(roadmaps.filter((roadmap) => roadmap._id !== roadmapId))

            toast.success(`Roadmap "${deletedRoadmap?.title}" deleted successfully`, { id: "delete-roadmap" })
        } catch (error) {
            console.error("Failed to delete roadmap:", error)
            toast.error("Failed to delete roadmap", { id: "delete-roadmap" })
        }
    }

    // View roadmap details
    const handleViewRoadmap = (roadmap) => {
        setSelectedRoadmap(roadmap)
        setViewDialogOpen(true)
        toast.info(`Viewing roadmap: ${roadmap.title}`)
    }

    const handleDialogOpen = (open) => {
        setDialogOpen(open)
        if (open) {
            toast.info("Creating new roadmap")
        } else if (!creating) {
            // Reset form when dialog is closed (but not when creating)
            setFormData({ title: "", goal: "", duration: "" })
        }
    }

    const handleViewDialogOpen = (open) => {
        setViewDialogOpen(open)
        if (!open) {
            setSelectedRoadmap(null)
        }
    }

    useEffect(() => {
        fetchRoadmaps()
    }, [])

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Roadmap Generator</h1>
                    <p className="text-muted-foreground">Create personalized learning roadmaps powered by AI</p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Roadmap
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create New Roadmap</DialogTitle>
                            <DialogDescription>
                                Fill in the details below to generate your personalized learning roadmap.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateRoadmap} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Learn React Development"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="goal">Goal</Label>
                                <Textarea
                                    id="goal"
                                    placeholder="Describe what you want to achieve..."
                                    value={formData.goal}
                                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                    required
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration</Label>
                                <Select
                                    value={formData.duration}
                                    onValueChange={(value) => {
                                        setFormData({ ...formData, duration: value })
                                        toast.info(`Duration set to ${value}`)
                                    }}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select duration" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {durationOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={creating}>
                                    {creating ? "Generating..." : "Generate Roadmap"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Separator />

            {/* Roadmaps Grid */}
            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="h-3 bg-muted rounded"></div>
                                    <div className="h-3 bg-muted rounded w-2/3"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : roadmaps.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <Map className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No roadmaps yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Create your first AI-generated learning roadmap to get started.
                        </p>
                        <Button onClick={() => setDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Roadmap
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {roadmaps.map((roadmap) => (
                        <Card key={roadmap._id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                        <CardTitle className="text-lg line-clamp-1">{roadmap.title}</CardTitle>
                                        <CardDescription className="line-clamp-2">{roadmap.goal}</CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {roadmap.duration}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(roadmap.createdAt)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 bg-transparent"
                                        onClick={() => handleViewRoadmap(roadmap)}
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-destructive hover:text-destructive bg-transparent"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Roadmap</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to delete "{roadmap.title}"? This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDeleteRoadmap(roadmap._id)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* View Roadmap Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={handleViewDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            {selectedRoadmap?.title}
                        </DialogTitle>
                        <DialogDescription>
                            <div className="flex items-center gap-4 mt-2">
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {selectedRoadmap?.duration}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    Created {selectedRoadmap && formatDate(selectedRoadmap.createdAt)}
                                </span>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">Goal:</h4>
                            <p className="text-sm text-muted-foreground">{selectedRoadmap?.goal}</p>
                        </div>
                        <Separator />
                        <div>
                            <h4 className="font-semibold mb-2">Generated Roadmap:</h4>
                            <div className="prose prose-sm max-w-none">
                                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">{selectedRoadmap?.generated}</pre>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}