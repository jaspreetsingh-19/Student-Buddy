"use client";
import React from 'react';
import {
  Brain,
  CheckSquare,
  BookOpen,
  Search,
  ArrowRight,
  Star,
  Users,
  Clock,
  Award,
  Target,
  Lightbulb,
  Zap,
  ChevronRight,
  Play,
  Menu,
  X
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
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: CheckSquare,
      title: "Smart Task Management",
      description: "Organize your studies with intelligent task scheduling, progress tracking, and automated reminders to keep you on track.",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: BookOpen,
      title: "AI Summarizer",
      description: "Transform lengthy textbooks and study materials into concise, easy-to-understand summaries powered by advanced AI technology.",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Search,
      title: "Explore Resources",
      description: "Access a vast library of curated study materials, practice tests, and educational content for all subjects and competitive exams.",
      color: "from-orange-500 to-red-600"
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "UPSC Aspirant",
      content: "Student Buddy's AI roadmap helped me structure my UPSC preparation perfectly. The task management feature keeps me disciplined and focused.",
      rating: 5
    },
    {
      name: "Rahul Gupta",
      role: "12th Grade Student",
      content: "The AI summarizer is a game-changer! It helped me quickly review all my subjects before board exams. Highly recommended!",
      rating: 5
    },
    {
      name: "Anjali Patel",
      role: "Engineering Student",
      content: "From JEE prep to college studies, Student Buddy has been my constant companion. The resource library is incredibly comprehensive.",
      rating: 5
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Students" },
    { number: "95%", label: "Success Rate" },
    { number: "1M+", label: "Study Hours Saved" },
    { number: "4.9/5", label: "User Rating" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="relative bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Student Buddy
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Testimonials</a>
              <Link href={"/pricing"} className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
              <div className="flex space-x-4">
                <button onClick={handleLogin} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105">
                  Login
                </button>
                <button onClick={handleGetStarted} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105">
                  Get Started
                </button>
              </div>

            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <a href="#features" className="block text-gray-600 hover:text-gray-900">Features</a>
              <a href="#testimonials" className="block text-gray-600 hover:text-gray-900">Testimonials</a>
              <a href="#pricing" className="block text-gray-600 hover:text-gray-900">Pricing</a>
              <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Ultimate{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Study Companion
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              From 12th grade to UPSC, from engineering to medical entrance exams -
              Student Buddy uses AI to revolutionize your study experience with personalized roadmaps,
              smart task management, and intelligent summarization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
                <span>Start Your Journey</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Play className="h-5 w-5" />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-600 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Every Student
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're preparing for boards, competitive exams, or professional courses,
              we have the tools to accelerate your success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 mb-6">{feature.description}</p>
                  <button className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-semibold">
                    <span>Learn More</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Student Buddy Works
            </h2>
            <p className="text-xl text-gray-600">Simple steps to transform your study experience</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Tell Us Your Goals",
                description: "Share your academic objectives, exam targets, and study preferences with our AI system.",
                icon: Target
              },
              {
                step: "02",
                title: "Get Your Roadmap",
                description: "Receive a personalized study plan with timelines, milestones, and resource recommendations.",
                icon: Lightbulb
              },
              {
                step: "03",
                title: "Study & Succeed",
                description: "Follow your AI-optimized plan, track progress, and achieve your academic goals faster.",
                icon: Award
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <item.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Students Everywhere
            </h2>
            <p className="text-xl text-gray-600">See what successful students say about Student Buddy</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Study Experience?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of successful students who are already using Student Buddy to achieve their academic goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2">
              <span>Start Free Trial</span>
              <Zap className="h-5 w-5" />
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">Student Buddy</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Empowering students with AI-driven study tools to achieve academic excellence and unlock their full potential.
              </p>
              <div className="flex space-x-4">
                {/* Social media icons would go here */}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Student Buddy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudentBuddyLandingPage;
