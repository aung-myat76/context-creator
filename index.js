import express from "express";
import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

// Load tokens from environment variables
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BASE_URL = process.env.BASE_URL; // e.g. https://your-bot.vercel.app

const app = express();
app.use(express.json());

// Create bot in webhook mode (❌ no polling on Vercel)
const bot = new TelegramBot(TELEGRAM_TOKEN);
bot.setWebHook(`${BASE_URL}/bot${TELEGRAM_TOKEN}`);

// Webhook endpoint (Telegram sends updates here)
app.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Message handler
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userText = msg.text;

  try {
    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${userText}, I want the review and about of this product to advertise in Facebook. Write it catchy, realistic, in Myanmar (Unicode), and like a real FB post. Just the review/ad text only (no extra reply text).`,
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
      "❌ Sorry, I couldn’t generate a response.";

    bot.sendMessage(chatId, reply);
  } catch (error) {
    console.error("Error:", error);
    bot.sendMessage(chatId, "⚠️ Something went wrong. Try again later.");
  }
});

// Root route for UptimeRobot check
app.get("/", (req, res) => {
  res.send("✅ Bot is running and alive!");
});

// Export Express app for Vercel
export default app;
