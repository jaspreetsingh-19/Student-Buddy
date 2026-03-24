# 🎓 Student Buddy

> Your all-in-one AI-powered academic assistant — built with Next.js, Gemini AI, Razorpay, and MongoDB.

Student Buddy helps students stay on top of their academic life through a beautiful, intuitive dashboard packed with AI-powered tools: generate roadmaps, summarize content, chat with PDFs, create flashcards, grade essays, take AI-generated quizzes, and much more.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Chatbot** | Conversational AI assistant for any academic question |
| 📄 **PDF Chat** | Upload any PDF and chat with it — get instant answers from your notes or textbooks |
| 🗺️ **Roadmap Generator** | Generate a structured learning roadmap for any topic |
| 📝 **Summarizer** | Paste or upload content and get a clean AI-generated summary |
| 🎥 **YouTube Summarizer** | Drop a YouTube URL and get a full transcript summary |
| 🃏 **Flashcards** | Auto-generate flashcard decks from any topic or content |
| 🧠 **Quiz Generator** | AI-powered quizzes with instant feedback |
| ✍️ **Essay Grader** | Get detailed feedback and a grade on any essay |
| ✅ **Task Manager** | Manage your assignments and to-dos in one place |
| 📊 **Dashboard Analytics** | Track your usage and study activity over time |
| 💳 **Payments** | Premium plans powered by Razorpay |
| 👤 **Auth** | Email/password + Google + GitHub OAuth |

---

## 🛠️ Tech Stack

- **Framework** — [Next.js 15](https://nextjs.org/) (App Router)
- **AI** — [Google Gemini AI](https://ai.google.dev/) (`gemini-2.5-flash`, `gemini-1.5-flash`)
- **Database** — [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/)
- **Auth** — JWT (`jose`, `jsonwebtoken`) + bcrypt + OAuth (Google, GitHub)
- **Payments** — [Razorpay](https://razorpay.com/)
- **Email** — [Mailtrap](https://mailtrap.io/)
- **UI** — [Tailwind CSS v4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) + [Lucide Icons](https://lucide.dev/)
- **State** — [Zustand](https://zustand-demo.pmnd.rs/)
- **Charts** — [Chart.js](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.js.org/)
- **Markdown** — [react-markdown](https://github.com/remarkjs/react-markdown) + [react-katex](https://github.com/MatejBransky/react-katex)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster
- A Google Gemini API key
- A Razorpay account (for payments)
- A Mailtrap account (for emails)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/student-buddy.git
cd student-buddy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Google Gemini AI
GOOGLE_AI_API_KEY=your_gemini_api_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Mailtrap
MAILTRAP_TOKEN=your_mailtrap_token

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ If your MongoDB password contains special characters like `@`, `!`, or `#`, URL-encode them (e.g. `@` → `%40`).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/              # Admin panel (analytics, logs, user management)
│   ├── api/                # All API route handlers
│   │   ├── auth/           # Login, signup, OAuth, password reset, email verify
│   │   ├── chat/           # AI chatbot sessions
│   │   ├── pdf-chat/       # PDF upload + streaming chat
│   │   ├── quiz/           # Quiz generation
│   │   ├── flashcards/     # Flashcard generation
│   │   ├── summarizer/     # Content summarizer
│   │   ├── youtube-summarizer/
│   │   ├── essay-grader/
│   │   ├── roadmap/
│   │   ├── task/
│   │   ├── razorpay-order/ # Payment order creation
│   │   └── usage/          # Usage stats
│   ├── auth/               # Auth pages (login, signup, verify, reset)
│   ├── dashboard/          # Main dashboard + feature pages
│   └── pricing/            # Pricing page
├── models/                 # Mongoose schemas
├── lib/                    # DB connection, utilities
└── helper/                 # Token helpers, etc.
```

---

## 🔐 Authentication

Student Buddy supports three auth methods:

- **Email & Password** — with email verification and password reset via Mailtrap
- **Google OAuth** — one-click sign in with Google
- **GitHub OAuth** — one-click sign in with GitHub

All sessions use JWT tokens stored in HTTP-only cookies.

---

## 💳 Payments

Payments are handled via **Razorpay**. Premium users unlock higher usage limits across all AI features. The payment flow is:

1. User selects a plan on `/pricing`
2. A Razorpay order is created via `/api/razorpay-order`
3. After successful payment, `/api/payment-success` upgrades the user's plan

---

## 📄 PDF Chat — How It Works

The PDF chat feature uses **Server-Sent Events (SSE)** to stream real-time progress back to the client during upload:

1. **Step 1** — PDF is sent as base64 to Gemini, which extracts all text and generates a welcome message in a single call
2. **Step 2** — A context summary is generated for use during the chat session (prevents truncation for large documents)
3. **Step 3** — Session is saved to MongoDB

Progress events (`33%` → `66%` → `100%`) are streamed live so the user always knows what's happening.

---

## 🧑‍💼 Admin Panel

Accessible at `/admin` for admin users. Includes:

- **Analytics** — platform-wide usage graphs
- **Logs** — activity logs across all users
- **User Management** — view and manage all accounts

---

## 📦 Building for Production

```bash
npm run build
npm start
```

For deployment on **Vercel**, add all `.env.local` variables to your Vercel project's environment variables. The `maxDuration = 120` export in the PDF chat route requires a **Vercel Pro** plan (Hobby is limited to 60s).

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📜 License

This project is private and not licensed for public distribution.

---

<p align="center">Built with ❤️ to make studying less painful.</p>
