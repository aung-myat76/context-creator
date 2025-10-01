import express from "express";
import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BASE_URL = process.env.BASE_URL; // e.g. https://context-creator.vercel.app

const app = express();
app.use(express.json());

// Create Telegram bot (no polling)
const bot = new TelegramBot(TELEGRAM_TOKEN);
bot.setWebHook(`${BASE_URL}/api/webhook`); // Vercel-friendly path

// Webhook endpoint
app.post("/api/webhook", (req, res) => {
  console.log("Webhook hit:", req.body); // debug
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Message handler
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userText = msg.text;

  try {
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
                  text: `${userText}, I want the review and about of this product to advertise in Facebook. Write it catchy, realistic, in Myanmar (Unicode), and like a real FB post. Just the review/ad text only.`,
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

// Root route for UptimeRobot
app.get("/", (req, res) => {
  res.send("✅ Bot is running and alive!");
});

// Export app for Vercel
export default app;
