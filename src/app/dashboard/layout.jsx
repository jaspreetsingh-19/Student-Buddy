"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Toaster, toast } from "sonner"


import {
    Home,
    LogOut,
    Moon,
    Settings,
    Sun,
    User,
    BarChart3,
    Mail,
    Menu,
    X,
    Map,
    NotebookText,
    Library,
    Bot,
    Crown,
    Lock,
    HelpCircle,
    Loader2,
    GraduationCap
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Feature usage limits for free users
const FREE_LIMITS = {
    doubts: 3,
    summaries: 2,
    roadmaps: 1
}

const getNavigationItems = (userPlan, usageCount = {}) => [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
        isPremium: false,
        isLocked: false,
        usageInfo: null
    },
    {
        title: "Tasks",
        url: "/dashboard/tasks",
        icon: BarChart3,
        isPremium: false,
        isLocked: false,
        usageInfo: null
    },
    {
        title: "Doubt Solver",
        url: "/dashboard/chatbot",
        icon: Bot,
        isPremium: false,
        isLocked: false,
        usageInfo: userPlan === 'free' ? {
            used: usageCount.doubts || 0,
            limit: FREE_LIMITS.doubts,
            type: 'daily'
        } : null
    },
    {
        title: "AI Roadmap Generator",
        url: "/dashboard/roadmap",
        icon: Map,
        isPremium: true,
        isLocked: userPlan === 'free',

    },
    {
        title: "Summarizer",
        url: "/dashboard/summarizer",
        icon: NotebookText,
        isPremium: false,
        isLocked: false,
        usageInfo: userPlan === 'free' ? {
            used: usageCount.summaries || 0,
            limit: FREE_LIMITS.summaries,
            type: 'daily'
        } : null
    },
    {
        title: "Explore Resources",
        url: "/dashboard/explore-resources",
        icon: Library,
        isPremium: true,
        isLocked: userPlan === 'free',
        usageInfo: null
    },
    {
        title: "Quiz Yourself",
        url: "/dashboard/quiz",
        icon: HelpCircle,
        isPremium: true,
        isLocked: userPlan === 'free',
        usageInfo: null
    },

]

const settingsItems = [
    {
        title: "Profile",
        url: "/profile",
        icon: User,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
]

const getInitials = (username) => {
    if (!username) return "";
    const parts = username.trim().split(" ");
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
};

// Check if user's premium is expired
const isPremiumExpired = (premiumExpiresAt) => {
    if (!premiumExpiresAt) return true;
    return new Date(premiumExpiresAt) < new Date();
};

// Get user's effective plan
const getUserPlan = (user) => {
    if (!user?.data) return 'free';

    const { isPremium, premiumExpiresAt } = user.data;

    if (!isPremium) return 'free';
    if (isPremiumExpired(premiumExpiresAt)) return 'free';

    return 'premium';
};

// Usage info component
const UsageIndicator = ({ usageInfo }) => {
    if (!usageInfo) return null;

    const { used, limit, type } = usageInfo;
    const isNearLimit = used >= limit * 0.8;
    const isAtLimit = used >= limit;

    return (
        <div className="ml-auto">
            <Badge
                variant={isAtLimit ? "destructive" : isNearLimit ? "secondary" : "outline"}
                className="text-xs px-1.5 py-0.5"
            >
                {used}/{limit} {type}
            </Badge>
        </div>
    );
};

// Premium badge component
const PremiumBadge = () => (
    <Crown className="h-3 w-3 text-yellow-500" />
);

// Lock icon for restricted features
const LockIcon = () => (
    <Lock className="h-3 w-3 text-muted-foreground" />
);

export default function DashboardLayout({ children }) {
    const [user, setUser] = useState(null)
    const [usageCount, setUsageCount] = useState({})
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const pathname = usePathname()
    const router = useRouter()


    useEffect(() => {
        const fetchUser = async () => {
            try {
                setIsLoading(true)
                const res = await axios.get("/api/auth/me")
                setUser(res.data)

                // Fetch usage statistics for free users
                if (getUserPlan(res.data) === 'free') {
                    const usageRes = await axios.get("/api/usage")


                    setUsageCount(usageRes.data)
                }
            } catch (error) {
                console.error("Failed to fetch user", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchUser()
    }, [])

    // Show full page loading until user data is loaded
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <BarChart3 className="size-4" />
                        </div>
                        <h1 className="text-lg font-semibold">Student Buddy</h1>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading your dashboard...</span>
                    </div>
                </div>
            </div>
        )
    }

    const userPlan = getUserPlan(user);
    const initial = getInitials(user?.data?.username)
    const navigationItems = getNavigationItems(userPlan, usageCount);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode)
        document.documentElement.classList.toggle("dark")
    }

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    const handleNavClick = (item, e) => {
        if (item.isLocked) {
            e.preventDefault();
            toast.error(`${item.title} is a premium feature. Upgrade to access unlimited usage!`, {
                action: {
                    label: "Upgrade",
                    onClick: () => router.push("/pricing")
                }
            });
            return;
        }

        // Check usage limits for free users
        if (userPlan === 'free' && item.usageInfo) {
            const { used, limit } = item.usageInfo;
            if (used >= limit) {
                e.preventDefault();
                toast.error(`You've reached your ${item.usageInfo.type} limit for ${item.title}. Upgrade for unlimited access!`, {
                    action: {
                        label: "Upgrade",
                        onClick: () => router.push("/pricing")
                    }
                });
                return;
            }
        }
    };

    async function handleLogout(e) {
        e.preventDefault()
        try {
            toast.success("logging out plz wait...")
            const response = await axios.get("/api/auth/logout")
            router.push("/auth/login")
        } catch (error) {

            toast.error("Something Went Wrong")
        }
    }

    return (
        <div className={cn("min-h-screen bg-background text-foreground", isDarkMode && "dark")}>
            {/* Top Bar - Full Width */}
            <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 dark:border-border dark:bg-background/95">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-9 w-9">
                        {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        <span className="sr-only">Toggle sidebar</span>
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <GraduationCap className="size-4" />
                        </div>
                        <h1 className="text-lg font-semibold">Student Buddy</h1>
                        {!isLoading && userPlan === 'premium' && (
                            <Badge variant="secondary" className="bg-accent text-accent-foreground border-accent-foreground/20">
                                <Crown className="h-3 w-3 mr-1" />
                                Premium
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {userPlan === 'free' && (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => router.push("/pricing")}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 border-0"
                        >
                            <Crown className="h-4 w-4 mr-1" />
                            Upgrade
                        </Button>
                    )}

                    <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="h-9 w-9">
                        {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                        className="flex items-center gap-2 border-border bg-background hover:bg-accent hover:text-accent-foreground dark:border-border dark:bg-background dark:hover:bg-accent dark:hover:text-accent-foreground"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </header>

            <div className="flex pt-16">
                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 transform border-r border-border bg-background transition-transform duration-300 ease-in-out dark:border-border dark:bg-background",
                        sidebarOpen ? "translate-x-0" : "-translate-x-full",
                    )}
                >
                    <div className="flex h-full flex-col">
                        {/* Sidebar Content */}
                        <div className="flex-1 overflow-auto p-4">
                            <div className="space-y-6">
                                {/* Premium Status Card for Free Users */}
                                {userPlan === 'free' && (
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Crown className="h-4 w-4 text-purple-600" />
                                            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                                Free Plan
                                            </span>
                                        </div>
                                        <p className="text-xs text-purple-700 dark:text-purple-300 mb-2">
                                            Unlock unlimited access to all features
                                        </p>
                                        <Button
                                            size="sm"
                                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 border-0"
                                            onClick={() => router.push("/pricing")}
                                        >
                                            Upgrade Now
                                        </Button>
                                    </div>
                                )}

                                {/* Navigation Section */}
                                <div>
                                    <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Navigation
                                    </h3>
                                    <nav className="space-y-1">
                                        {navigationItems.map((item) => {
                                            const isCurrentPath = pathname === item.url;
                                            const isClickable = !item.isLocked;

                                            return (
                                                <Link
                                                    key={item.title}
                                                    href={item.url}
                                                    onClick={(e) => handleNavClick(item, e)}
                                                    className={cn(
                                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                                        isClickable
                                                            ? "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
                                                            : "opacity-60 cursor-not-allowed",
                                                        isCurrentPath && isClickable &&
                                                        "bg-accent text-accent-foreground dark:bg-accent dark:text-accent-foreground",
                                                        item.isLocked && "text-muted-foreground"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <item.icon className="h-4 w-4" />
                                                        {item.isLocked && <LockIcon />}
                                                    </div>
                                                    <span className="flex-1">{item.title}</span>
                                                    <UsageIndicator usageInfo={item.usageInfo} />
                                                </Link>
                                            );
                                        })}
                                    </nav>
                                </div>

                                {/* Account Section */}

                            </div>
                        </div>

                        {/* Sidebar Footer */}
                        <div className="p-4 border-t border-border dark:border-border">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                                    <AvatarFallback>{initial}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col flex-1">
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-semibold">{user?.data.username || "..."}</span>
                                        {userPlan === 'premium' && <Crown className="h-3 w-3 text-yellow-500" />}
                                    </div>
                                    <span className="text-xs text-muted-foreground">{user?.data.email || "..."}</span>
                                    <Badge
                                        variant={userPlan === 'premium' ? 'default' : 'secondary'}
                                        className="text-xs mt-1 w-fit"
                                    >
                                        {userPlan === 'premium' ? 'Premium' : 'Free Plan'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className={cn("flex-1 transition-all duration-300 ease-in-out", sidebarOpen ? "ml-64" : "ml-0")}>
                    <div className="p-6">{children}</div>
                    <Toaster position="top-right" />
                </main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-30 bg-black/50 dark:bg-black/70 lg:hidden" onClick={toggleSidebar} />
            )}
        </div>
    )
}