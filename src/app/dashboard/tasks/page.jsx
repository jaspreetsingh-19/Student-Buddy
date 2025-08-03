"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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



import {
    ChevronDown,
    ChevronRight,
    Plus,
    MoreHorizontal,
    Edit,
    Trash2,
    Calendar,
    Clock,
    CheckCircle2,
    Circle,
    AlertCircle,
    Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import axios from "axios"
import { toast } from "sonner"




export default function TasksContent() {
    const [taskDays, setTaskDays] = useState([])
    const [loading, setLoading] = useState(true)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [editingTask, setEditingTask] = useState(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)


    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0], // Today's date
        dueTime: "",
        priority: "",
        category: "",
    })

    // Fetch tasks from API
    const fetchTasks = async () => {
        try {
            setLoading(true)
            toast.loading("Loading tasks...", { id: "fetch-tasks" })
            const response = await axios.get("/api/task")
            const groupedTasks = groupTasksByDate(response.data.tasks)
            setTaskDays(groupedTasks)
            toast.success(`Loaded ${response.data.tasks.length} tasks successfully`, { id: "fetch-tasks" })
        } catch (error) {
            toast.error("Failed to load tasks. Please try again.", { id: "fetch-tasks" })
        } finally {
            setLoading(false)
        }
    }

    // Group tasks by date
    const groupTasksByDate = (tasks) => {
        const grouped = tasks.reduce((acc, task) => {
            const taskDate = new Date(task.date).toISOString().split("T")[0]
            if (!acc[taskDate]) {
                acc[taskDate] = []
            }
            acc[taskDate].push(task)
            return acc
        }, {})

        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        return Object.entries(grouped)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, tasks]) => {
                const taskDate = new Date(date)
                let displayDate = taskDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })

                // Add relative date labels
                if (date === today.toISOString().split("T")[0]) {
                    displayDate = `Today, ${taskDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`
                } else if (date === tomorrow.toISOString().split("T")[0]) {
                    displayDate = `Tomorrow, ${taskDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`
                }

                return {
                    date,
                    displayDate,
                    tasks: tasks.sort((a, b) => {
                        // Sort by completion status first, then by due time
                        if (a.isCompleted !== b.isCompleted) {
                            return a.isCompleted ? 1 : -1
                        }
                        if (a.dueTime && b.dueTime) {
                            return a.dueTime.localeCompare(b.dueTime)
                        }
                        return 0
                    }),
                    isExpanded: date === today.toISOString().split("T")[0], // Expand today by default
                }
            })
    }

    // Load tasks on component mount
    useEffect(() => {
        fetchTasks()
        toast.info("Task management loaded - ready to organize your tasks!")
    }, [])

    const toggleDay = (dateIndex) => {
        setTaskDays((prev) =>
            prev.map((day, index) => (index === dateIndex ? { ...day, isExpanded: !day.isExpanded } : day)),
        )
        const day = taskDays[dateIndex]
        if (day.isExpanded) {
            toast.info(`Collapsed ${day.displayDate}`)
        } else {
            toast.info(`Expanded ${day.displayDate} - ${day.tasks.length} tasks`)
        }
    }

    const toggleTask = async (task) => {
        try {
            toast.loading(`${task.isCompleted ? 'Reopening' : 'Completing'} task...`, { id: "toggle-task" })
            await axios.patch(`/api/task/${task._id}`, {
                isCompleted: !task.isCompleted,
            })

            // Update local state
            setTaskDays((prev) =>
                prev.map((day) => ({
                    ...day,
                    tasks: day.tasks.map((t) => (t._id === task._id ? { ...t, isCompleted: !t.isCompleted } : t)),
                })),
            )

            toast.success(`Task "${task.title}" ${!task.isCompleted ? "completed" : "reopened"}`, { id: "toggle-task" })

            if (!task.isCompleted) {
                toast.success("Great job! Keep up the momentum!", { duration: 2000 })
            }
        } catch (error) {
            toast.error("Failed to update task. Please try again.", { id: "toggle-task" })
        }
    }

    const deleteTask = async (taskId) => {
        const taskToDelete = taskDays.flatMap(day => day.tasks).find(task => task._id === taskId)

        try {
            toast.loading("Deleting task...", { id: "delete-task" })
            await axios.delete(`/api/task/${taskId}`)

            // Update local state
            setTaskDays(
                (prev) =>
                    prev
                        .map((day) => ({
                            ...day,
                            tasks: day.tasks.filter((task) => task._id !== taskId),
                        }))
                        .filter((day) => day.tasks.length > 0), // Remove empty days
            )

            toast.success(`Task "${taskToDelete?.title || 'Unknown'}" deleted successfully`, { id: "delete-task" })
        } catch (error) {
            toast.error("Failed to delete task. Please try again.", { id: "delete-task" })
        }
    }

    const addTask = async () => {
        if (!newTask.title.trim() || !newTask.category.trim()) {
            toast.error("Title and category are required")
            return
        }

        try {
            setSubmitting(true)
            toast.loading("Creating new task...", { id: "add-task" })
            await axios.post("/api/task", {
                ...newTask,
                date: new Date(newTask.date),
            })

            // Refresh tasks to get updated list
            await fetchTasks()

            const taskTitle = newTask.title
            setNewTask({
                title: "",
                description: "",
                date: new Date().toISOString().split("T")[0],
                dueTime: "",
                priority: "",
                category: "",
            })
            setIsAddDialogOpen(false)

            toast.success(`Task "${taskTitle}" created successfully`, { id: "add-task" })
            toast.info("Task form cleared - ready for next task")
        } catch (error) {

            toast.error("Failed to create task. Please try again.", { id: "add-task" })
        } finally {
            setSubmitting(false)
        }
    }

    const updateTask = async () => {
        if (!editingTask || !editingTask.title.trim() || !editingTask.category.trim()) {
            toast.error("Title and category are required")
            return
        }

        try {
            setSubmitting(true)
            toast.loading("Updating task...", { id: "update-task" })
            await axios.patch(`/api/task/${editingTask._id}`, {
                title: editingTask.title,
                description: editingTask.description,
                date: editingTask.date,
                dueTime: editingTask.dueTime,
                priority: editingTask.priority,
                category: editingTask.category,
            })

            // Refresh tasks to get updated list
            await fetchTasks()

            const taskTitle = editingTask.title
            setEditingTask(null)
            setIsEditDialogOpen(false)

            toast.success(`Task "${taskTitle}" updated successfully`, { id: "update-task" })
        } catch (error) {
            toast.error("Failed to update task. Please try again.", { id: "update-task" })
        } finally {
            setSubmitting(false)
        }
    }

    const formatTime = (time) => {
        if (!time) return ""
        const [hours, minutes] = time.split(":")
        const hour = Number.parseInt(hours)
        const ampm = hour >= 12 ? "PM" : "AM"
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${ampm}`
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            case "medium":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
            case "low":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
        }
    }

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case "high":
                return <AlertCircle className="h-3 w-3" />
            case "medium":
                return <Clock className="h-3 w-3" />
            case "low":
                return <Circle className="h-3 w-3" />
            default:
                return <Circle className="h-3 w-3" />
        }
    }

    const totalTasks = taskDays.reduce((acc, day) => acc + day.tasks.length, 0)
    const completedTasks = taskDays.reduce((acc, day) => acc + day.tasks.filter((task) => task.isCompleted).length, 0)
    const highPriorityTasks = taskDays.reduce(
        (acc, day) => acc + day.tasks.filter((task) => task.priority === "high" && !task.isCompleted).length,
        0,
    )

    const handleDialogOpen = (isOpen) => {
        setIsAddDialogOpen(isOpen)
        if (isOpen) {
            toast.info("Add task dialog opened")
        } else {
            toast.info("Add task dialog closed")
            if (newTask.title || newTask.description || newTask.category) {
                toast.info("Unsaved changes discarded")
            }
        }
    }

    const handleEditDialogOpen = (isOpen) => {
        setIsEditDialogOpen(isOpen)
        if (isOpen) {
            toast.info("Edit task dialog opened")
        } else {
            toast.info("Edit task dialog closed")
            if (!isOpen) {
                setEditingTask(null)
            }
        }
    }

    const handleTaskFieldChange = (field, value) => {
        setNewTask((prev) => ({ ...prev, [field]: value }))

        // Show helpful toasts for specific fields
        if (field === 'priority' && value === 'high') {
            toast.warning("High priority task - make sure to allocate sufficient time!")
        }
        if (field === 'dueTime' && value) {
            toast.success("Due time set - you'll be well organized!")
        }
    }

    const handleEditTaskFieldChange = (field, value) => {
        setEditingTask((prev) => (prev ? { ...prev, [field]: value } : null))

        // Show helpful toasts for specific fields
        if (field === 'priority' && value === 'high') {
            toast.warning("Changed to high priority - make sure to allocate sufficient time!")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading tasks...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Task Management</h1>
                    <p className="text-muted-foreground">Organize and track your administrative tasks</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={handleDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Task</DialogTitle>
                            <DialogDescription>Create a new task with details and due date.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={newTask.title}
                                    onChange={(e) => handleTaskFieldChange('title', e.target.value)}
                                    placeholder="Enter task title"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={newTask.description}
                                    onChange={(e) => handleTaskFieldChange('description', e.target.value)}
                                    placeholder="Enter task description (optional)"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="category">Category *</Label>
                                <Input
                                    id="category"
                                    value={newTask.category}
                                    onChange={(e) => handleTaskFieldChange('category', e.target.value)}
                                    placeholder="e.g., Security, Maintenance, Development"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={newTask.date}
                                        onChange={(e) => handleTaskFieldChange('date', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="dueTime">Due Time</Label>
                                    <Input
                                        id="dueTime"
                                        type="time"
                                        value={newTask.dueTime}
                                        onChange={(e) => handleTaskFieldChange('dueTime', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="priority">Priority</Label>
                                <select
                                    id="priority"
                                    value={newTask.priority}
                                    onChange={(e) => handleTaskFieldChange('priority', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="submit"
                                onClick={addTask}
                                disabled={!newTask.title.trim() || !newTask.category.trim() || submitting}
                            >
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Task
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Task Statistics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTasks}</div>
                        <p className="text-xs text-muted-foreground">
                            {completedTasks} completed ({totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{highPriorityTasks}</div>
                        <p className="text-xs text-muted-foreground">Requires immediate attention</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">Overall progress</p>
                    </CardContent>
                </Card>
            </div>

            {/* Task Days */}
            <div className="space-y-4">
                {taskDays.length === 0 ? (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
                                <p className="text-muted-foreground mb-4">Get started by creating your first task</p>
                                <Button onClick={() => {
                                    setIsAddDialogOpen(true)
                                    toast.success("Let's create your first task!")
                                }}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Your First Task
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    taskDays.map((day, dayIndex) => (
                        <Card key={day.date}>
                            <CardHeader
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => toggleDay(dayIndex)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {day.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        <CardTitle className="text-lg">{day.displayDate}</CardTitle>
                                        <Badge variant="secondary">{day.tasks.length} tasks</Badge>
                                        {day.tasks.filter((task) => !task.isCompleted && task.priority === "high").length > 0 && (
                                            <Badge variant="destructive" className="text-xs">
                                                {day.tasks.filter((task) => !task.isCompleted && task.priority === "high").length} high priority
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                            {day.tasks.filter((task) => task.isCompleted).length}/{day.tasks.length} completed
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>

                            {day.isExpanded && (
                                <CardContent className="pt-0">
                                    <div className="space-y-3">
                                        {day.tasks.map((task) => (
                                            <div
                                                key={task._id}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 border rounded-lg transition-colors hover:bg-muted/50",
                                                    task.isCompleted && "opacity-60",
                                                )}
                                            >
                                                <Checkbox
                                                    checked={task.isCompleted}
                                                    onCheckedChange={() => toggleTask(task)}
                                                    className="mt-1"
                                                />

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className={cn("font-medium", task.isCompleted && "line-through text-muted-foreground")}>
                                                            {task.title}
                                                        </h4>
                                                        <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
                                                            <div className="flex items-center gap-1">
                                                                {getPriorityIcon(task.priority)}
                                                                {task.priority}
                                                            </div>
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            {task.category}
                                                        </Badge>
                                                    </div>
                                                    {task.description && <p className="text-sm text-muted-foreground mb-1">{task.description}</p>}
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        {task.dueTime && (
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {formatTime(task.dueTime)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setEditingTask(task)
                                                                setIsEditDialogOpen(true)
                                                                toast.info(`Editing task: ${task.title}`)
                                                            }}
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                deleteTask(task._id)
                                                                toast.warning("Task deletion initiated")
                                                            }}
                                                            className="text-red-600 dark:text-red-400"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))
                )}
            </div>

            {/* Edit Task Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                        <DialogDescription>Update task details and settings.</DialogDescription>
                    </DialogHeader>
                    {editingTask && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-title">Title *</Label>
                                <Input
                                    id="edit-title"
                                    value={editingTask.title}
                                    onChange={(e) => handleEditTaskFieldChange('title', e.target.value)}
                                    placeholder="Enter task title"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editingTask.description || ""}
                                    onChange={(e) => handleEditTaskFieldChange('description', e.target.value)}
                                    placeholder="Enter task description (optional)"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-category">Category *</Label>
                                <Input
                                    id="edit-category"
                                    value={editingTask.category}
                                    onChange={(e) => handleEditTaskFieldChange('category', e.target.value)}
                                    placeholder="e.g., Security, Maintenance, Development"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-date">Date</Label>
                                    <Input
                                        id="edit-date"
                                        type="date"
                                        value={editingTask.date.split("T")[0]}
                                        onChange={(e) => handleEditTaskFieldChange('date', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-dueTime">Due Time</Label>
                                    <Input
                                        id="edit-dueTime"
                                        type="time"
                                        value={editingTask.dueTime || ""}
                                        onChange={(e) => handleEditTaskFieldChange('dueTime', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-priority">Priority</Label>
                                <select
                                    id="edit-priority"
                                    value={editingTask.priority}
                                    onChange={(e) => handleEditTaskFieldChange('priority', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            type="submit"
                            onClick={updateTask}
                            disabled={!editingTask?.title.trim() || !editingTask?.category.trim() || submitting}
                        >
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Task
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}