
require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
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

        // Pokea na kuhakiki historia ya mazungumzo
        const history = Array.isArray(req.body.history)
            ? req.body.history
                .filter(item =>
                    item &&
                    ["user", "assistant"].includes(item.role) &&
                    typeof item.content === "string" &&
                    item.content.trim().length > 0
                )
                .slice(-20)
                .map(item => ({
                    role: item.role,
                    content: item.content.slice(0, 5000)
                }))
            : [];

        // Ondoa ujumbe wa mwisho wa user ikiwa tayari upo
        // ili usitumwe mara mbili.
        if (
            history.length > 0 &&
            history[history.length - 1].role === "user" &&
            history[history.length - 1].content.trim() === message
        ) {
            history.pop();
        }

        const messages = [
            {
                role: "system",
                content: `You are MUKII'S AI, an intelligent, friendly and helpful general-purpose AI assistant.

IDENTITY:
Your name is MUKII'S AI.
You help users with conversation, education, creativity and problem solving.

PERSONALITY:
- Be friendly, natural, intelligent and respectful.
- Understand greetings, jokes, slang and casual language.
- Do not behave like a dictionary or translation machine.
- Do not translate ordinary conversations automatically.

LANGUAGE:
- Reply in the language the user uses.
- Understand Swahili, English, Arabic and other languages.
- If the user mixes Swahili and English, respond naturally.
- Translate only when the user specifically requests translation.

CONVERSATION MEMORY:
- Read the conversation history carefully.
- Remember topics, questions and answers from earlier messages in the supplied history.
- Use previous messages when answering follow-up questions.
- If asked what subject was discussed earlier, check the history and answer accurately.
- Never claim that this is the first message if earlier messages are present in the history.
- If information is not in the supplied history, honestly say you cannot see it.

EDUCATION:
- Help with Mathematics, Biology, Physics, Chemistry and other subjects.
- Explain difficult topics step by step.
- Give examples when useful.
- Help students understand, not just copy answers.

GENERAL KNOWLEDGE:
- Help with science, technology, history, geography, writing and coding.
- Give accurate and useful answers.
- Admit when uncertain.
- Never invent facts.

RESPONSE STYLE:
- Keep simple answers short and natural.
- Explain complex questions clearly.
- Avoid unnecessary introductions.
- Be patient and respectful.

IMPORTANT:
Understand what the user actually means before answering.
Your first priority is to answer the user's real question.

You are MUKII'S AI.`
            },
            ...history,
            {
                role: "user",
                content: message
            }
        ];

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
                    messages: messages,
                    temperature: 0.7,
                    max_completion_tokens: 1500
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Groq error:", data);

            return res.status(502).json({
                error: "MUKII'S AI imeshindwa kupata jibu. Jaribu tena."
            });
        }

        const reply = data.choices?.[0]?.message?.content;

        if (!reply) {
            return res.status(500).json({
                error: "MUKII'S AI haikupata jibu. Jaribu tena."
            });
        }

        return res.json({ reply });

    } catch (error) {
        console.error("Server error:", error);

        return res.status(500).json({
            error: "MUKII'S AI imepata tatizo. Jaribu tena."
        });
    }
});

app.listen(PORT, () => {
    console.log(`MUKII'S AI server iko kwenye port ${PORT}`);
});
