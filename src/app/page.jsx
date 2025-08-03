"use client";
import React from 'react';
import {
  Brain,
  CheckSquare,
  BookOpen,
  Search,
  ArrowRight,
  Users,
  Clock,
  Award,
  Target,
  Lightbulb,
  Zap,
  ChevronRight,
  Play,
  Menu,
  X,
  HelpCircle,
  FileText,
  Trophy
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const StudentBuddyLandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const router = useRouter();

  const handleGetStarted = (e) => {
    e.preventDefault();
    router.push('/auth/signup');
  }
  const handleLogin = (e) => {
    e.preventDefault();
    router.push('/auth/login');
  }

  const features = [
    {
      icon: Brain,
      title: "AI Roadmap Generator",
      description: "Get personalized study plans and career roadmaps tailored to your goals, whether you're preparing for boards, competitive exams, or professional courses.",
      color: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-50 dark:bg-violet-950",
      iconBg: "bg-gradient-to-r from-violet-500 to-purple-600"
    },
    {
      icon: FileText,
      title: "AI Summarizer",
      description: "Transform lengthy textbooks and study materials into concise, easy-to-understand summaries powered by advanced AI technology.",
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      iconBg: "bg-gradient-to-r from-blue-500 to-cyan-600"
    },
    {
      icon: CheckSquare,
      title: "Task Management",
      description: "Organize your studies with intelligent task scheduling, progress tracking, and automated reminders to keep you on track.",
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
      iconBg: "bg-gradient-to-r from-emerald-500 to-teal-600"
    },
    {
      icon: Trophy,
      title: "Quiz Yourself",
      description: "Test your knowledge with AI-generated quizzes and practice questions tailored to your study materials and learning progress.",
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50 dark:bg-amber-950",
      iconBg: "bg-gradient-to-r from-amber-500 to-orange-600"
    },
    {
      icon: HelpCircle,
      title: "Doubt Solver",
      description: "Get instant answers to your questions with our AI-powered doubt resolution system that explains concepts clearly and thoroughly.",
      color: "from-rose-500 to-pink-600",
      bgColor: "bg-rose-50 dark:bg-rose-950",
      iconBg: "bg-gradient-to-r from-rose-500 to-pink-600"
    },
    {
      icon: Search,
      title: "Explore Resources",
      description: "Access a vast library of curated study materials, practice tests, and educational content for all subjects and competitive exams.",
      color: "from-indigo-500 to-blue-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950",
      iconBg: "bg-gradient-to-r from-indigo-500 to-blue-600"
    }
  ];



  const benefits = [
    {
      icon: Target,
      title: "Personalized Learning",
      description: "AI adapts to your learning style and pace"
    },
    {
      icon: Clock,
      title: "Time Efficient",
      description: "Study smarter, not harder with optimized schedules"
    },
    {
      icon: Award,
      title: "Proven Results",
      description: "Track your progress and celebrate achievements"
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Connect with fellow learners and mentors"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Student Buddy
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="ml-auto flex items-center space-x-8">
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Features
              </a>
              <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Pricing
              </Link>

            </div>
            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={handleLogin}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
              >
                Login
              </button>
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="container py-6 space-y-4">
              <a href="#features" className="block text-sm font-medium text-muted-foreground hover:text-primary">
                Features
              </a>
              <Link href="/pricing" className="block text-sm font-medium text-muted-foreground hover:text-primary">
                Pricing
              </Link>
              <Link href="/about" className="block text-sm font-medium text-muted-foreground hover:text-primary">
                About
              </Link>
              <div className="flex flex-col space-y-2 pt-4">
                <button
                  onClick={handleLogin}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
                >
                  Login
                </button>
                <button
                  onClick={handleGetStarted}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Your Ultimate{' '}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Study Companion
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              From 12th grade to UPSC, from engineering to medical entrance exams -
              Student Buddy uses AI to revolutionize your study experience with personalized roadmaps,
              smart task management, and intelligent summarization.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>

            </div>
          </div>


        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Powerful Features for Every Student
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Whether you're preparing for boards, competitive exams, or professional courses,
              we have the tools to accelerate your success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300 p-6 h-full">
                  <div className={`w-12 h-12 ${feature.iconBg} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{feature.description}</p>

                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 lg:py-32 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How Student Buddy Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Simple steps to transform your study experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Tell Us Your Goals",
                description: "Share your academic objectives, exam targets, and study preferences with our AI system.",
                icon: Target
              },
              {
                title: "Get Your Roadmap",
                description: "Receive a personalized study plan with timelines, milestones, and resource recommendations.",
                icon: Lightbulb
              },
              {
                title: "Study & Succeed",
                description: "Follow your AI-optimized plan, track progress, and achieve your academic goals faster.",
                icon: Award
              }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="mx-auto mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Choose Student Buddy?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Experience the difference with our AI-powered study platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Transform Your Study Experience?
            </h2>
            <p className="mt-4 text-lg text-violet-100">
              Join thousands of successful students who are already using Student Buddy to achieve their academic goals.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-white text-violet-600 hover:bg-gray-100 h-12 px-8"
              >
                Start Free Trial
                <Zap className="ml-2 h-4 w-4" />
              </button>

            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">Student Buddy</span>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md">
                Empowering students with AI-driven study tools to achieve academic excellence and unlock their full potential.
              </p>
            </div>



            <div>
              <h3 className="font-semibold mb-4">Support</h3>


              <p href="#" className="hover:text-primary transition-colors">Contact Us at projectstudentbuddy1@gmail.com</p>


            </div>
          </div>

          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Student Buddy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudentBuddyLandingPage;