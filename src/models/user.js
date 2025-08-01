
import mongoose from "mongoose"


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function () {
            return this.authProvider === "credentials"
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["student", "admin"],
        default: "student",
    },
    lastLogin: {
        type: Date,
        default: null
    },
    isPremium: {
        type: Boolean,
        default: false,
    },
    premiumType: {
        type: String,
        default: null,
    },
    premiumExpiresAt: {
        type: Date,
        default: null,
    },
    authProvider: {
        type: String,
        enum: ["credentials", "google", "github"],
        default: "credentials"
    },


    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verificationToken: String,
    verificationTokenExpiry: Date
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User