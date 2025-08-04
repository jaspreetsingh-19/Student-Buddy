# 🎓 Student Buddy

**Student Buddy** is your all-in-one AI-powered academic assistant built with Next.js 15, Gemini AI, Razorpay, and MongoDB. It helps students stay on top of their tasks, generate roadmaps, summarize content, generate AI-powered quizzes, and much more — all from a beautiful, intuitive dashboard.

![Student Buddy Preview](https://your-screenshot-url.com)

---

## 🚀 Features

- ✅ **Authentication** with secure JWT flow: OAuth login, email verification, forgot/reset password
- 📅 **Daily Task Manager** — create and view tasks by date
- 🧠 **AI Summarizer** — summarize text or YouTube videos
- 🧭 **Roadmap Generator** — get AI-powered career & topic paths
- 📚 **Resource Library** — explore curated resources with search
- 📝 **Quiz Generator** — create quizzes with difficulty & question count
- 👨‍💼 **Admin Panel** — manage users, analytics, and logs
- 💳 **Razorpay Integration** — support for premium plans with webhook handling
- 🧩 Built with **Modular & Scalable Architecture**

---

## 🛠️ Tech Stack

| Layer      | Tech                                                           |
| ---------- | -------------------------------------------------------------- |
| Frontend   | Next.js 15 (App Router), Tailwind CSS, ShadCN UI, Lucide Icons |
| Backend    | Next.js API Routes, JWT Auth                                   |
| Database   | MongoDB (Mongoose)                                             |
| AI Engine  | Google Generative AI SDK (Gemini)                              |
| Payments   | Razorpay (Subscriptions + Webhooks)                            |
| Deployment | Vercel                                                         |

---

## 📁 Project Structure

```text
student-buddy/
├── public/                                # Static files (favicon, logos, images)
│
├── src/
│   ├── app/                               # App Router pages and routes
│   │   ├── layout.tsx                     # Root layout
│   │   ├── page.tsx                       # Landing page
│   │
│   │   ├── dashboard/                     # Main user dashboard
│   │   │   ├── layout.jsx
│   │   │   ├── page.jsx
│   │   │   ├── tasks/                      # Task management UI
│   │   │   ├── summarizer/                # Text + YouTube summarizer
│   │   │   ├── quiz/                      # Quiz creation and dashboard
│   │   │   ├── roadmap/                   # Roadmap generation
│   │   │   ├── explore-resources/                 # Resource library
│   │   │   └── chatbot/                  # doubt solver ui
│   │
│   │   ├── auth/                          # Auth pages
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── signup/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   ├── verify-email/
│   │   │   └── callback/                  # Token callback handler
│   │
│   │   ├── admin/                         # Admin dashboard
│   │   │   ├── layout.jsx
│   │   │   └── analytics/
│   │   │   └── logs/
│   │   │   └── user/                     # User Management

│   │
│   │   └── api/                           # API routes
│   │       ├── auth/
│   │       ├── admin/
│   │       ├── chat/
│   │       ├── dashboard/
│   │       ├── payment-success/
│   │       ├── quiz/
│   │       ├── razorpay-order/
│   │       ├── resources/
│   │       ├── roadmap/
│   │       ├── summarizer/
│   │       ├── task/
│   │       ├── usage/
│   │
│
│   ├── components/                        # UI components
│   │   ├── ui/                            # ShadCN components (buttons, inputs)
│   │
│
│   ├── lib/                               # Utility functions and logic
│   │   ├── db.js                          # MongoDB connection
│   │   ├── aiForChatbot                   # Quiz Generator Logic
│   │   ├── logCreator                     # Log Creationg Logic
│   │   ├── mailTemplates
│   │   ├── quote.js                       # Logic For Generating random quotes
│   │   ├── getDataFromToken.ts           # JWT decoding
│   │
│   ├── helper/
│   │   ├── getDataFromToken.ts           # JWT decoding
│   │   ├── mailtrap.config.js            # Mail Sending logic
│   │
│   │
│
│   ├── models/                            # Mongoose models
│   │   ├── user.js
│   │   ├── task.js
│   │   ├── quiz.js
│   │   ├── quizQuestion.js
│   │   ├── summarizer.js
│   │   ├── roadmap.js
│   │   ├── resources.js
│   │   └── payment.js
│   │   └── usage.js
│   │   └── logs.js
│   │   └── message.js
│
│   ├── styles/
│   │   └── globals.css                   # Tailwind base styles
│
│   └── middleware.ts                     # Middleware for auth, etc.
│
├── .env.local                            # Environment variables (never commit)
├── next.config.js                        # Next.js config
├── postcss.config.js
├── tailwind.config.ts
├── package.json
└── README.md


```

---

## 🛠️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/jaspreetsingh-19/Student-Buddy.git
cd student-buddy
npm install
```

---

### 2. Setup Environment Variables

Create a .env file in the root with the following variables:

```bash
env

MONGO_URI=your_mongo_uri
TOKEN_SECRET=TOKEN_SECRET
DOMAIN=Domain_URL
MAILTRAP_TOKEN=MAILTRAP_TOKEN
GOOGLE_AI_API_KEY=GOOGLE_AI_API_KEY
GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=GOOGLE_REDIRECT_URI
NEXT_PUBLIC_CLIENT_URL=NEXT_PUBLIC_CLIENT_URL
GITHUB_CLIENT_ID=GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET=GITHUB_CLIENT_SECRET
GITHUB_REDIRECT_URI=GITHUB_REDIRECT_URI
RAZORPAY_KEY_ID=RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET=RAZORPAY_KEY_SECRET
NEXT_PUBLIC_RAZORPAY_KEY_ID=NEXT_PUBLIC_RAZORPAY_KEY_ID

```

---

### 3. Run the Development Server

```bash
npm run dev

```

---

### Features In Action

1.Visit /dashboard after login

2.Generate summaries from /dashboard/summarizer

3.Generate and take quizzes from /dashboard/quiz

4.Admin controls at /admin

5.Premium feature access enabled after Razorpay payment

---

## 🌐 Deployment

Deployed on [Vercel](https://vercel.com)

Push to `main` branch → Auto deploys to:  
🔗 [https://student-buddy.vercel.app](https://student-buddy.vercel.app)

---

### 🙌 Contributing

Contributors are welcome! Feel free to submit issues or pull requests.

---

### 📄 License

This project is licensed under the MIT License.

---

### 📧 Contact

Built by Jaspreet Singh  
📧 Email: [jaspreetsingh7192006@gmail.com](mailto:jaspreetsingh7192006@gmail.com)

⭐ **If you liked this project, don’t forget to give it a star!**

---
