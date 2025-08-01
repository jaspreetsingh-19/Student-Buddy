import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export async function getAIResponse(message, conversationHistory = []) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Build context from conversation history
        let contextPrompt = `You are an educational assistant helping students with their academic doubts.
Provide clear, accurate, and helpful explanations. Be encouraging and supportive.

If the message is not an academic doubt or is unrelated to education, respond with:
"I'm sorry, I can only help with academic questions."
Use simple bullet points (-)
- No markdown formatting (**bold**, ##headers, etc.)



Conversation History:
        `;


        // Add conversation history for context
        conversationHistory.forEach(msg => {
            contextPrompt += `${msg.role === 'user' ? 'Student' : 'Assistant'}: ${msg.content} \n`;
        });

        contextPrompt += `\nStudent: ${message} \nAssistant: `;

        const result = await model.generateContent(contextPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('AI Response Error:', error);
        return "I'm sorry, I'm having trouble processing your question right now. Please try again.";
    }
}