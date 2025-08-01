// lib/quote.js

export async function getQuote() {
    try {
        const res = await fetch('https://dummyjson.com/quotes/random/10')
        const response = await res.json()
        console.log("Fetched quotes:", response)
        let quoteId = Math.floor(Math.random() * 10) + 1;
        const quote = response[quoteId].quote
        console.log("Selected quote:", quote)




        return quote // returns just the quote text

    } catch (error) {
        console.error("Quote fetch error:", error)
        return "Stay focused. You can do this!"
    }
}
