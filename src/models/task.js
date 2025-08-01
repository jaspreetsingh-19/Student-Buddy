import mongoose from "mongoose"

const taskSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        date: {
            type: Date, // Store the date the task is assigned for (e.g., July 22, 2025)
            required: true,
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
        dueTime: {
            type: String,
        },
        category: {
            type: String,
            required: true,
        }

    },
    { timestamps: true }
)

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

export default Task;
