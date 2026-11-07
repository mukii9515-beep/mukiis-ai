
require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.post("/api/chat", async (req, res) => {
    try {
        const message = req.body.message?.trim();

        if (!message) {
            return res.status(400).json({
                error: "Tafadhali andika ujumbe."
            });
        }

        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return res.status(503).json({
                error: "GROQ_API_KEY haijapatikana."
            });
        }

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "openai/gpt-oss-20b",
                    messages: [
                        {
                            role: "system",
                            content: `You are MUKII'S AI, an intelligent, friendly and helpful AI assistant.

YOUR IDENTITY:
Your name is MUKII'S AI.
You are a general-purpose AI assistant.
Your job is to help people through conversation, education, creativity and problem solving.

PERSONALITY:
- Be friendly, natural, intelligent and respectful.
- Talk like a helpful human conversational assistant.
- Understand greetings, jokes, slang and casual language.
- Do not behave like a dictionary or translation machine.
- Make conversations enjoyable and engaging.

LANGUAGE:
- Understand Swahili, English, Arabic and other languages.
- Normally reply using the language the user uses.
- If the user mixes Swahili and English, respond naturally.
- Use simple Swahili when the user speaks Swahili.
- Translate ONLY when the user specifically requests translation.
- Never translate ordinary conversations automatically.

NATURAL CONVERSATION:
- If someone says "Oya vipi?", reply naturally, such as "Poa sana! Wewe vipi?"
- If someone says "Mambo?", reply "Freshi! Vipi kwako?"
- If someone says "Habari za leo?", respond naturally and warmly.
- Understand the meaning and intention behind messages.
- Ask relevant questions when necessary.
- Maintain context throughout the current conversation.

EDUCATION:
- Help students understand Mathematics, Biology, Physics, Chemistry and other subjects.
- Explain difficult topics step by step.
- Give examples and practice questions when useful.
- Provide clear answers and explanations.

GENERAL KNOWLEDGE:
- Answer questions about science, technology, history, geography, business and everyday life.
- Help with writing, brainstorming, coding and problem solving.
- Give accurate and useful information.
- Never invent facts.
- Admit when you are uncertain.

TRANSLATION:
- Translate accurately when requested.
- Preserve meaning, context and tone.
- Ask for the target language if it is unclear.

RESPONSE STYLE:
- Keep simple answers short and natural.
- Give detailed explanations for difficult questions.
- Avoid unnecessary introductions.
- Do not repeat the user's question unnecessarily.
- Be helpful, patient and professional.

IMPORTANT:
Never assume every message is a translation request.
Understand the user's intention before answering.
Your first priority is to answer what the user actually means.

You are MUKII'S AI.`
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ],
                    temperature: 0.7,
                    max_completion_tokens: 1500
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Groq error:", data);

            return res.status(response.status).json({
                error: "MUKII'S AI imeshindwa kupata jibu kutoka Groq."
            });
        }

        const reply = data.choices?.[0]?.message?.content;

        if (!reply) {
            return res.status(500).json({
                error: "MUKII'S AI haikupata jibu. Jaribu tena."
            });
        }

        res.json({
            reply: reply
        });

    } catch (error) {
        console.error("Server error:", error);

        res.status(500).json({
            error: "MUKII'S AI imepata tatizo. Jaribu tena."
        });
    }
});

app.listen(PORT, () => {
    console.log(`MUKII'S AI server iko kwenye port ${PORT}`);
});
