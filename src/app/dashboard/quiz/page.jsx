"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus,
    BookOpen,
    Clock,
    Target,
    TrendingUp,
    Play,
    Trash2,
    Filter,
    Search,
    Calendar,
    Award,
    ChevronRight,
    Brain,
    CheckCircle,
    XCircle,
    BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';

const QuizDashboard = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('all');
    const [activeTab, setActiveTab] = useState('overview');
    const router = useRouter()

    // Quiz creation form state
    const [quizForm, setQuizForm] = useState({
        topic: '',
        difficulty: 'medium',
        questionType: 'multiple-choice',
        questionNumbers: 5
    });

    // Quiz taking state
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [quizResults, setQuizResults] = useState(null);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const response = await axios.get('/api/quiz');
            setQuizzes(response.data.quizzes || []);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createQuiz = async () => {
        try {
            const response = await axios.post('/api/quiz', quizForm);

            if (response.status === 200) {
                await fetchQuizzes();
                setIsCreateDialogOpen(false);
                setQuizForm({ topic: '', difficulty: 'medium', questionType: 'multiple-choice', questionNumbers: 5 });
            }
        } catch (error) {
            console.error('Error creating quiz:', error);
        }
    };

    const deleteQuiz = async (quizId) => {
        try {
            const response = await axios.delete(`/api/quiz?quizId=${quizId}`);

            if (response.status === 200) {
                await fetchQuizzes();
            }
        } catch (error) {
            console.error('Error deleting quiz:', error);
        }
    };

    const startQuiz = (quiz) => {
        setCurrentQuiz(quiz);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
        setActiveTab('take-quiz');
    };

    const handleAnswerSelect = (questionId, optionIndex) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };


    // Fixed function to go back to quiz list instead of staying in quiz interface
    const backToQuizList = () => {
        setShowResults(false);
        setCurrentQuiz(null);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setQuizResults(null);
        setActiveTab('my-quizzes');
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < currentQuiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            finishQuiz();
        }
    };

    const previousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const finishQuiz = () => {
        let correct = 0;
        const results = currentQuiz.questions.map((question, index) => {
            const selectedOption = selectedAnswers[question._id];
            const correctOption = question.options.findIndex(opt => opt.isCorrect);
            const isCorrect = selectedOption === correctOption;

            if (isCorrect) correct++;

            return {
                question: question.questionText,
                selectedAnswer: selectedOption !== undefined ? question.options[selectedOption]?.text : 'Not answered',
                correctAnswer: question.options[correctOption]?.text,
                isCorrect,
                explanation: question.explanation
            };
        });

        setQuizResults({
            score: correct,
            total: currentQuiz.questions.length,
            percentage: Math.round((correct / currentQuiz.questions.length) * 100),
            results
        });
        setShowResults(true);
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const filteredQuizzes = quizzes.filter(quiz => {
        const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quiz.topic.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDifficulty = filterDifficulty === 'all' || quiz.difficulty === filterDifficulty;
        return matchesSearch && matchesDifficulty;
    });

    const stats = {
        totalQuizzes: quizzes.length,
        totalQuestions: quizzes.reduce((sum, quiz) => sum + quiz.totalQuestions, 0),
        avgDifficulty: quizzes.length > 0 ?
            quizzes.reduce((sum, quiz) => {
                const difficultyScore = quiz.difficulty === 'easy' ? 1 : quiz.difficulty === 'medium' ? 2 : 3;
                return sum + difficultyScore;
            }, 0) / quizzes.length : 0
    };

    if (showResults && quizResults) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Quiz Results</CardTitle>
                        <CardDescription>How did you perform?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center">
                            <div className="text-6xl font-bold text-primary mb-2">
                                {quizResults.percentage}%
                            </div>
                            <div className="text-lg text-muted-foreground">
                                {quizResults.score} out of {quizResults.total} correct
                            </div>
                            <div className="mt-4">
                                <Progress value={quizResults.percentage} className="w-full" />
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {quizResults.results.map((result, index) => (
                                <Card key={index} className={`border-l-4 ${result.isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                                    <CardContent className="pt-4">
                                        <div className="flex items-start gap-2 mb-2">
                                            {result.isCorrect ?
                                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" /> :
                                                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                            }
                                            <div className="flex-1">
                                                <p className="font-medium mb-2">{result.question}</p>
                                                <div className="space-y-1 text-sm">
                                                    <p><span className="font-medium">Your answer:</span> {result.selectedAnswer}</p>
                                                    <p><span className="font-medium">Correct answer:</span> {result.correctAnswer}</p>
                                                    {result.explanation && (
                                                        <p className="text-muted-foreground"><span className="font-medium">Explanation:</span> {result.explanation}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="flex justify-center gap-2">
                            <Button onClick={backToQuizList} variant="outline">
                                Back to Quizzes
                            </Button>
                            <Button onClick={() => startQuiz(currentQuiz)}>
                                Retake Quiz
                            </Button>


                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (currentQuiz && !showResults) {
        const currentQuestion = currentQuiz.questions[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;

        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{currentQuiz.title}</h1>
                        <p className="text-muted-foreground">
                            Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
                        </p>
                    </div>
                    <Badge className={getDifficultyColor(currentQuiz.difficulty)}>
                        {currentQuiz.difficulty}
                    </Badge>
                </div>

                <Progress value={progress} className="w-full" />

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{currentQuestion.questionText}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={selectedAnswers[currentQuestion._id] !== undefined ? `${currentQuestion._id}-${selectedAnswers[currentQuestion._id]}` : undefined}
                            onValueChange={(value) => {
                                const optionIndex = parseInt(value.split('-')[1]);
                                handleAnswerSelect(currentQuestion._id, optionIndex);
                            }}
                            className="space-y-3"
                        >
                            {currentQuestion.options.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <RadioGroupItem value={`${currentQuestion._id}-${index}`} id={`option-${currentQuestion._id}-${index}`} />
                                    <Label htmlFor={`option-${currentQuestion._id}-${index}`} className="flex-1 cursor-pointer">
                                        {option.text}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </CardContent>
                </Card>

                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={previousQuestion}
                        disabled={currentQuestionIndex === 0}
                    >
                        Previous
                    </Button>
                    <Button onClick={nextQuestion}>
                        {currentQuestionIndex === currentQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next'}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Quiz Center</h1>
                    <p className="text-muted-foreground">Create, manage and take quizzes to test your knowledge</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Create Quiz
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Quiz</DialogTitle>
                            <DialogDescription>
                                Generate an AI-powered quiz on any topic
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="topic">Topic</Label>
                                <Input
                                    id="topic"
                                    placeholder="Enter quiz topic (e.g., JavaScript, History"
                                    value={quizForm.topic}
                                    onChange={(e) => setQuizForm(prev => ({ ...prev, topic: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="difficulty">Difficulty</Label>
                                <Select value={quizForm.difficulty} onValueChange={(value) => setQuizForm(prev => ({ ...prev, difficulty: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="easy">Easy</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="hard">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="questionType">Question Type</Label>
                                <Select value={quizForm.questionType} onValueChange={(value) => setQuizForm(prev => ({ ...prev, questionType: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                        <SelectItem value="true-false">True/False</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="questionNumbers">Number of Questions</Label>
                                <Select value={quizForm.questionNumbers.toString()} onValueChange={(value) => setQuizForm(prev => ({ ...prev, questionNumbers: parseInt(value) }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5 Questions</SelectItem>
                                        <SelectItem value="10">10 Questions</SelectItem>
                                        <SelectItem value="15">15 Questions</SelectItem>
                                        <SelectItem value="20">20 Questions</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={createQuiz} disabled={!quizForm.topic.trim()}>
                                    {isLoading ? "Generating" : "Generate Quiz"}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="my-quizzes">My Quizzes</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
                                <p className="text-xs text-muted-foreground">
                                    Quizzes created
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                                <Brain className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalQuestions}</div>
                                <p className="text-xs text-muted-foreground">
                                    Questions generated
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg Difficulty</CardTitle>
                                <Target className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.avgDifficulty < 1.5 ? 'Easy' : stats.avgDifficulty < 2.5 ? 'Medium' : 'Hard'}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Average complexity
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Quizzes</CardTitle>
                            <CardDescription>Your latest quiz creations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {quizzes.slice(0, 3).map((quiz) => (
                                <div key={quiz._id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <BookOpen className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{quiz.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {quiz.totalQuestions} questions • {quiz.topic}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={getDifficultyColor(quiz.difficulty)}>
                                            {quiz.difficulty}
                                        </Badge>
                                        <Button size="sm" onClick={() => startQuiz(quiz)}>
                                            <Play className="h-3 w-3 mr-1" />
                                            Start
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {quizzes.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No quizzes created yet</p>
                                    <p className="text-sm">Create your first quiz to get started!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="my-quizzes" className="space-y-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search quizzes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Difficulties</SelectItem>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredQuizzes.map((quiz) => (
                            <Card key={quiz._id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{quiz.title}</CardTitle>
                                            <CardDescription>{quiz.topic}</CardDescription>
                                        </div>
                                        <Badge className={getDifficultyColor(quiz.difficulty)}>
                                            {quiz.difficulty}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Brain className="h-3 w-3" />
                                                {quiz.totalQuestions} questions
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                ~{quiz.totalQuestions * 2} min
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            Created {new Date(quiz.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => startQuiz(quiz)}
                                            >
                                                <Play className="h-3 w-3 mr-1" />
                                                Start Quiz
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => deleteQuiz(quiz._id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredQuizzes.length === 0 && searchTerm && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No quizzes found</p>
                            <p className="text-sm">Try adjusting your search or filters</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default QuizDashboard;