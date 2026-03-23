import connect from "@/lib/db"
import { NextResponse } from "next/server"
import Flashcard from "@/models/Flashcard"
import { getDataFromToken } from "@/helper/getDataFromToken"
import { GoogleGenerativeAI } from "@google/generative-ai"
import Log from "@/models/logs"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)

// GET - fetch all decks for user
export async function GET(request) {
    try {
        await connect()
        const userId = await getDataFromToken(request)

        const { searchParams } = new URL(request.url)
        const deckId = searchParams.get("deckId")

        if (deckId) {
            const deck = await Flashcard.findOne({ _id: deckId, userId })
            if (!deck) return NextResponse.json({ error: "Deck not found" }, { status: 404 })
            return NextResponse.json({ deck })
        }

        const decks = await Flashcard.find({ userId }).sort({ updatedAt: -1 })
        return NextResponse.json({ decks })
    } catch (error) {
        console.error("GET /api/flashcards error:", error)
        return NextResponse.json({ error: "Failed to fetch flashcards" }, { status: 500 })
    }
}

// POST - generate a new flashcard deck from notes
export async function POST(request) {
    try {
        await connect()
        const userId = await getDataFromToken(request)
        const { notes, deckName, topic, cardCount = 10 } = await request.json()

        if (!notes || !topic) {
            return NextResponse.json({ error: "Notes and topic are required" }, { status: 400 })
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const prompt = `You are an expert educator creating spaced-repetition flashcards.

Given these student notes on "${topic}", generate exactly ${cardCount} high-quality flashcards.

Notes:
${notes}

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "cards": [
    {
      "front": "Clear, specific question or prompt",
      "back": "Concise, accurate answer or explanation"
    }
  ]
}

Guidelines:
- Questions should be specific and test understanding, not just recall
- Answers should be clear and concise (1-3 sentences max)
- Cover the most important concepts from the notes
- Mix different question types: definitions, explanations, applications, comparisons
- Avoid overly long cards`

        const result = await model.generateContent(prompt)
        const responseText = result.response.text().trim()

        let parsed
        try {
            const cleaned = responseText.replace(/```json|```/g, "").trim()
            parsed = JSON.parse(cleaned)
        } catch {
            return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
        }

        const deck = new Flashcard({
            userId,
            deckName: deckName || `${topic} Flashcards`,
            topic,
            cards: parsed.cards.map((c) => ({
                front: c.front,
                back: c.back,
                status: "new",
                easeFactor: 2.5,
                interval: 1,
                repetitions: 0,
                nextReviewDate: new Date(),
                lastReviewDate: null,
            })),
        })

        await deck.save()

        // Log usage
        try {
            await Log.create({ userId, action: "flashcard_generate", topic })
        } catch {}

        return NextResponse.json({ deck, message: "Deck created successfully" })
    } catch (error) {
        console.error("POST /api/flashcards error:", error)
        return NextResponse.json({ error: "Failed to generate flashcards" }, { status: 500 })
    }
}

// PATCH - update a single card's spaced repetition status after review
// Body: { deckId, cardId, quality } where quality 0-5 (SM-2 algorithm)
export async function PATCH(request) {
    try {
        await connect()
        const userId = await getDataFromToken(request)
        const { deckId, cardId, quality } = await request.json()

        // quality: 0=blackout, 1=wrong, 2=wrong but familiar, 3=correct hard, 4=correct, 5=easy
        const deck = await Flashcard.findOne({ _id: deckId, userId })
        if (!deck) return NextResponse.json({ error: "Deck not found" }, { status: 404 })

        const card = deck.cards.id(cardId)
        if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 })

        // SM-2 algorithm
        if (quality >= 3) {
            if (card.repetitions === 0) card.interval = 1
            else if (card.repetitions === 1) card.interval = 6
            else card.interval = Math.round(card.interval * card.easeFactor)

            card.repetitions += 1
            card.easeFactor = Math.max(
                1.3,
                card.easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
            )
        } else {
            card.repetitions = 0
            card.interval = 1
        }

        // Set status based on repetitions and quality
        if (quality < 3) {
            card.status = "learning"
        } else if (card.repetitions >= 5 && quality >= 4) {
            card.status = "mastered"
        } else if (card.repetitions >= 2) {
            card.status = "review"
        } else {
            card.status = "learning"
        }

        card.lastReviewDate = new Date()
        card.nextReviewDate = new Date(Date.now() + card.interval * 24 * 60 * 60 * 1000)

        await deck.save()
        return NextResponse.json({ card, message: "Card updated" })
    } catch (error) {
        console.error("PATCH /api/flashcards error:", error)
        return NextResponse.json({ error: "Failed to update card" }, { status: 500 })
    }
}

// DELETE - delete a deck
export async function DELETE(request) {
    try {
        await connect()
        const userId = await getDataFromToken(request)
        const { searchParams } = new URL(request.url)
        const deckId = searchParams.get("deckId")

        await Flashcard.findOneAndDelete({ _id: deckId, userId })
        return NextResponse.json({ message: "Deck deleted" })
    } catch (error) {
        console.error("DELETE /api/flashcards error:", error)
        return NextResponse.json({ error: "Failed to delete deck" }, { status: 500 })
    }
}