import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

// Replace with your tokens
const TELEGRAM_TOKEN = "8410439403:AAEndqAjyamPjIKm7MkFbslcLNG_uvIarvI";
const GEMINI_API_KEY = "AIzaSyBbEIhlx6Owy4qGYnuWb_gZMFMo9wYS3NQ";

// Start Telegram bot
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const userText = msg.text;

    // Call Gemini API
    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
            GEMINI_API_KEY,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: `${userText}, I want the review and about of this product to advertise in facebook. write me that and make it attract and catchy. I want in Myanmar language. Make it like realistic. reference with other posts that have posted in fb. I only want review adn ads text not your reply text. exclude that. make it unicode font. my hashtag with myanmar font aren't right like in review. make it the same font.`,
                            },
                        ],
                    },
                ],
            }),
        }
    );

    const data = await response.json();
    const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn’t reply.";

    bot.sendMessage(chatId, reply);
});
