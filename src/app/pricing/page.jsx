"use client"

import React, { useState } from 'react';
import { Check, X, Star, Zap } from 'lucide-react';
import axios from 'axios';
import { toast } from "sonner"
import { useRouter } from 'next/navigation';
const StudentBuddyPricing = () => {
    const [isYearly, setIsYearly] = useState(false);
    const [loading, setLoading] = useState(null);
    const router = useRouter()

    const plans = [
        {
            name: "Free Plan",
            icon: "🥉",
            price: "₹0",
            period: "forever",
            description: "Perfect for getting started with basic study tools",
            features: {
                "Task Manager": true,
                "Summarizer (Text)": "3 summaries/day limit",
                "YouTube Summarizer": false,
                "AI Chat Assistant": false,
                "Roadmap Generator": false,
                "Resource Explorer": "Limited topics only",
                "Priority Response Time": false,
                "Ad-Free Experience": false,
                "Support & Feedback": "Basic email support"
            },
            buttonText: "Get Started Free",
            buttonStyle: "bg-gray-100 text-gray-800 hover:bg-gray-200",
            popular: false,
            planType: "free"
        },
        {
            name: "Monthly Plan",
            icon: "🥈",
            price: isYearly ? "₹42" : "₹50",
            period: isYearly ? "per month" : "per month",
            originalPrice: isYearly ? "₹50" : null,
            description: "Unlock all features and boost your productivity",
            features: {
                "Task Manager": true,
                "Summarizer (Text)": true,
                "YouTube Summarizer": true,
                "AI Chat Assistant": true,
                "Roadmap Generator": true,
                "Resource Explorer": true,
                "Priority Response Time": true,
                "Ad-Free Experience": true,
                "Support & Feedback": "Priority support"
            },
            buttonText: "Start Monthly Plan",
            buttonStyle: "bg-indigo-600 text-white hover:bg-indigo-700",
            popular: !isYearly,
            planType: "monthly",
            amount: 50
        },
        {
            name: "Yearly Plan",
            icon: "🥇",
            price: "₹500",
            period: "per year",
            monthlyEquivalent: "₹42/month",
            savings: "Save ₹100",
            description: "Best value! All premium features at the lowest cost",
            features: {
                "Task Manager": true,
                "Summarizer (Text)": true,
                "YouTube Summarizer": true,
                "AI Chat Assistant": true,
                "Roadmap Generator": true,
                "Resource Explorer": true,
                "Priority Response Time": true,
                "Ad-Free Experience": true,
                "Support & Feedback": "Priority support"
            },
            buttonText: "Choose Yearly Plan",
            buttonStyle: "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600",
            popular: isYearly,
            planType: "yearly",
            amount: 500
        }
    ];

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async (plan) => {
        if (plan.planType === 'free') {
            // Handle free plan signup
            router.push("/dashboard");
            return;
        }

        setLoading(plan.planType);

        try {
            // Load Razorpay script
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                alert('Razorpay SDK failed to load. Please check your internet connection.');
                setLoading(null);
                return;
            }

            // Create order using axios
            const response = await axios.post('/api/razorpay-order', {
                amount: plan.amount,
                premiumType: plan.planType
            });

            const data = response.data;

            const { order } = data;

            // Configure Razorpay options
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'Student Buddy',
                description: `${plan.name} - ${plan.description}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const paymentResult = await axios.post('/api/payment-success', {
                            razorpay_order_id: order.id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            premiumType: plan.planType

                        });

                        if (paymentResult.data.success) {
                            toast.success('Payment successful! Premium activated.');
                            router.push("/dashboard");
                        } else {
                            toast.error('Payment verified, but failed to activate premium.');
                        }
                    } catch (error) {
                        console.error("Payment success verification failed:", error);
                        toast.error('Payment failed to verify.');
                    }
                },
                prefill: {
                    name: 'Student',
                    email: 'student@example.com',
                    contact: '9999999999'
                },
                theme: {
                    color: '#4F46E5'
                },
                modal: {
                    ondismiss: function () {
                        setLoading(null);
                    }
                }
            };

            // Open Razorpay checkout
            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (error) {
            console.error('Payment error:', error);


            if (error.response) {

                const errorMessage = error.response.data?.error || 'Payment failed. Please try again.';
                toast.error(errorMessage);
            } else if (error.request) {

                toast.error('Network error. Please check your internet connection.');
            } else {

                toast.error('Something went wrong. Please try again.');
            }

            setLoading(null);
        }
    };

    const FeatureIcon = ({ feature, value }) => {
        if (value === true) {
            return <Check className="w-5 h-5 text-green-500 flex-shrink-0" />;
        } else if (value === false) {
            return <X className="w-5 h-5 text-red-400 flex-shrink-0" />;
        } else {
            return <Check className="w-5 h-5 text-amber-500 flex-shrink-0" />;
        }
    };

    const getFeatureText = (value) => {
        if (typeof value === 'string') return value;
        return value ? 'Full access' : 'Not available';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-pulse">
                            Choose Your Study Plan
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                            Unlock your academic potential with Student Buddy. From basic tools to AI-powered study assistance.
                        </p>

                    </div>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="flex flex-col lg:flex-row gap-6 justify-center items-stretch">
                    {plans.map((plan, index) => (
                        <div
                            key={plan.name}
                            className={`relative bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex-1 max-w-sm ${plan.popular ? 'ring-2 ring-indigo-500 ring-opacity-50 scale-105' : ''
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 mt-5 rounded-full text-xs font-bold flex items-center space-x-1">
                                        <Star className="w-3 h-3" />
                                        <span>Popular</span>
                                    </div>
                                </div>
                            )}

                            <div className="p-6">
                                {/* Plan Header */}
                                <div className="text-center mb-6">
                                    <div className="text-2xl mb-1">{plan.icon}</div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                                    <p className="text-gray-600 text-xs mb-3">{plan.description}</p>

                                    <div className="flex items-baseline justify-center space-x-1">
                                        <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                                        <span className="text-gray-500 text-sm">/{plan.period}</span>
                                    </div>

                                    {plan.monthlyEquivalent && (
                                        <p className="text-xs text-gray-500 mt-1">{plan.monthlyEquivalent}</p>
                                    )}

                                    {plan.savings && (
                                        <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold mt-2">
                                            {plan.savings}
                                        </span>
                                    )}
                                </div>

                                {/* Key Features List (Limited) */}
                                <div className="space-y-2 mb-6">
                                    {Object.entries(plan.features).slice(0, 5).map(([feature, value]) => (
                                        <div key={feature} className="flex items-start space-x-2">
                                            <FeatureIcon feature={feature} value={value} />
                                            <div className="flex-1">
                                                <span className="text-gray-900 text-sm font-medium">{feature}</span>
                                                {typeof value === 'string' && (
                                                    <div className="text-xs text-gray-500">{value}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="text-xs text-gray-500 text-center pt-2">
                                        + {Object.keys(plan.features).length - 5} more features
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <button
                                    onClick={() => handlePayment(plan)}
                                    disabled={loading === plan.planType}
                                    className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${plan.buttonStyle} focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                                >
                                    {loading === plan.planType ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        plan.buttonText
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feature Comparison Table */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Detailed Feature Comparison</h2>
                    <p className="text-lg text-gray-600">See exactly what's included in each plan</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Features</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">🥉 Free</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">🥈 Monthly</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">🥇 Yearly</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {Object.keys(plans[0].features).map((feature) => (
                                    <tr key={feature} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{feature}</td>
                                        {plans.map((plan) => (
                                            <td key={plan.name} className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <FeatureIcon feature={feature} value={plan.features[feature]} />
                                                    <span className="text-sm text-gray-600">
                                                        {getFeatureText(plan.features[feature])}
                                                    </span>
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                </div>

                <div className="space-y-8">
                    {[
                        {
                            question: "Can I upgrade or downgrade my plan anytime?",
                            answer: "Yes! You can upgrade to a higher plan anytime. If you downgrade, the changes will take effect at the end of your current billing cycle."
                        },
                        {
                            question: "What happens to my data if I cancel?",
                            answer: "Your data remains safe for 30 days after cancellation. You can reactivate your account anytime during this period to restore full access."
                        },
                        {
                            question: "Is there a student discount available?",
                            answer: "Student Buddy is already designed with students in mind with affordable pricing. The yearly plan offers the best value with significant savings."
                        },
                        {
                            question: "How does the AI Chat Assistant work?",
                            answer: "Our AI assistant helps you with study queries, explains concepts, and provides personalized learning guidance based on your academic needs."
                        }
                    ].map((faq, index) => (
                        <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                            <p className="text-gray-600">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Boost Your Studies?</h2>
                    <p className="text-xl text-blue-100 mb-8">Join thousands of students who are already succeeding with Student Buddy</p>
                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <button
                            onClick={() => handlePayment(plans[0])}
                            className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors"
                        >
                            Start Free Trial
                        </button>
                        <button className="bg-indigo-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-400 transition-colors">
                            View Demo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentBuddyPricing;