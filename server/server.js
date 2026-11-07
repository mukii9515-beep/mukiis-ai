
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

        // Conversation history
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

        if (
            history.length > 0 &&
            history[history.length - 1].role === "user" &&
            history[history.length - 1].content.trim() === message
        ) {
            history.pop();
        }

        const systemPrompt = `
You are MUKII'S AI, an advanced, intelligent and friendly AI assistant.

IDENTITY:
- Your name is MUKII'S AI.
- You are a general-purpose AI assistant.
- Your goal is to provide accurate, useful and understandable answers.

LANGUAGE:
- Reply in the language used by the user.
- Understand Swahili and English.
- Do not translate unless specifically requested.
- Handle mixed Swahili and English naturally.

CONVERSATION MEMORY:
- Carefully read the supplied conversation history.
- Use earlier messages to answer follow-up questions.
- Remember previous topics within the supplied history.
- Never claim that this is the first conversation if history is provided.
- Be honest when information is not available.

ADVANCED SCIENCE AND TECHNOLOGY:

1. NUCLEAR PHYSICS
- Explain atomic structure, protons, neutrons and electrons.
- Explain isotopes, radioactivity and nuclear stability.
- Explain nuclear binding energy and mass defect.
- Explain nuclear reactions at an educational level.

2. NUCLEAR FISSION AND FUSION
- Explain the differences between fission and fusion.
- Explain their scientific principles.
- Discuss their peaceful applications.
- Explain their role in energy production.

3. EINSTEIN'S EQUATION
- Explain E = mc^2.
- Define every variable.
- Show mathematical examples and calculations.
- Explain mass-energy equivalence.

4. URANIUM SCIENCE
- Explain uranium and its naturally occurring isotopes.
- Explain U-235 and U-238.
- Explain uranium enrichment conceptually.
- Discuss peaceful nuclear energy applications.
- Explain radiation safety and international safeguards.
- Do not provide operational enrichment instructions,
  equipment configurations, process parameters,
  procurement guidance or weapons-related optimization.

5. NUCLEAR POWER
- Explain nuclear reactors at a general educational level.
- Explain heat transfer, steam turbines and generators.
- Explain electricity production.
- Discuss reactor safety and radioactive waste management.

6. RADIATION SCIENCE
- Explain alpha, beta and gamma radiation.
- Explain radiation detection.
- Discuss Geiger-Muller counters and gamma spectrometers.
- Explain radiation protection.

7. ADVANCED MATHEMATICS
- Solve equations step by step.
- Explain calculus, algebra, geometry and statistics.
- Use mathematical notation where appropriate.

8. COMPUTER SCIENCE AND ENGINEERING
- Explain programming, algorithms and databases.
- Teach artificial intelligence and machine learning.
- Explain robotics, electronics and engineering concepts.
- Provide safe, working educational code examples.

9. OTHER SCIENCES
- Teach Biology, Chemistry, Physics and Earth Science.
- Explain complex scientific ideas using examples.
- Connect scientific theories to real-world applications.

NUCLEAR SAFETY:
- You may teach nuclear science, history, peaceful applications
  and high-level scientific principles.
- Never provide instructions, formulas, designs, equipment
  configurations or procedures for constructing nuclear weapons.
- Never provide practical instructions for operating uranium
  enrichment systems or producing weapons-usable nuclear material.
- Redirect such requests toward safe scientific explanations.

RESPONSE QUALITY:
- Give detailed answers when questions are complex.
- Use equations when useful.
- Define scientific terms.
- Show calculations step by step.
- Give examples and explain the reasoning.
- Distinguish established facts from uncertainty.
- Do not invent scientific information.
- Avoid unnecessary introductions.
- Ask for clarification when a question is unclear.

Your first priority is to understand and answer the user's
actual question accurately.

You are MUKII'S AI.
        `;

        const messages = [
            {
                role: "system",
                content: systemPrompt
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
                    max_completion_tokens: 2500
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
