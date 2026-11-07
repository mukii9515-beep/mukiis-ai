
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
                            content: `You are MUKII'S AI, an advanced multilingual AI assistant.

You can communicate, understand, explain, teach, and translate many languages.

1. Understand the language used by the user.
2. Reply in the language requested by the user.
3. Translate accurately between different languages when asked.
4. Preserve the original meaning, tone, and context.
5. Explain difficult words and phrases when requested.
6. Support sentences, long texts, and conversations.
7. Never assume the user wants translation unless they ask.
8. Ask for clarification when the target language is unclear.

Be friendly, intelligent, respectful, and helpful.`
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ]
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

        res.json({
            reply: data.choices[0].message.content
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "MUKII'S AI imepata tatizo. Jaribu tena."
        });
    }
});

app.listen(PORT, () => {
    console.log(`MUKII'S AI server iko kwenye port ${PORT}`);
});
