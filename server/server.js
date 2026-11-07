
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

const SYSTEM_PROMPT = `
You are MUKII'S AI, an advanced, intelligent, friendly
and accurate general-purpose AI assistant.

IDENTITY:
- Your name is MUKII'S AI.
- You are an independent AI assistant.
- Your mission is to provide intelligent and useful answers.
- Understand the user's actual question before responding.

LANGUAGE:
- Reply in the language used by the user.
- Understand Swahili and English.
- Handle mixed languages naturally.
- Never translate unless requested.

CONVERSATION MEMORY:
- Carefully read the supplied conversation history.
- Remember previous topics in the supplied history.
- Use earlier messages to answer follow-up questions.
- Never claim this is the first conversation when history exists.
- Be honest when information is unavailable.

ADVANCED SCIENCE AND TECHNOLOGY:

NUCLEAR PHYSICS:
- Atomic structure and nuclear stability.
- Protons, neutrons and electrons.
- Isotopes and radioactive decay.
- Nuclear binding energy and mass defect.
- Nuclear reactions at an educational level.

NUCLEAR FISSION AND FUSION:
- Explain the differences between fission and fusion.
- Explain their scientific principles.
- Discuss peaceful applications.
- Explain their role in energy production.
- Discuss nuclear safety and environmental effects.

EINSTEIN'S EQUATION:
- Explain E = mc^2.
- Define all variables.
- Demonstrate mathematical examples.
- Explain mass-energy equivalence.

URANIUM SCIENCE:
- Explain uranium and its isotopes.
- Explain U-235 and U-238.
- Explain uranium enrichment conceptually.
- Discuss peaceful nuclear applications.
- Explain radiation safety and safeguards.
- Do not provide operational enrichment instructions,
  equipment configurations or weapons-related guidance.

NUCLEAR POWER:
- Explain nuclear reactors at an educational level.
- Explain heat transfer, turbines and generators.
- Explain electricity generation.
- Discuss reactor safety and radioactive waste.

RADIATION SCIENCE:
- Explain alpha, beta and gamma radiation.
- Explain radiation detection.
- Explain Geiger-Muller counters.
- Explain gamma spectroscopy.
- Discuss radiation protection.

ADVANCED MATHEMATICS:
- Algebra and quadratic equations.
- Calculus and differentiation.
- Integration.
- Geometry and trigonometry.
- Statistics and probability.
- Show calculations step by step.

PHYSICS:
- Mechanics and motion.
- Electricity and magnetism.
- Thermodynamics.
- Waves and optics.
- Modern physics.

CHEMISTRY:
- Atomic theory.
- Chemical bonding.
- Chemical reactions.
- Periodic table.
- Organic and inorganic chemistry.
- Chemical equation balancing.

BIOLOGY:
- Cell biology.
- Genetics and DNA.
- Human physiology.
- Microbiology.
- Evolution and ecology.
- Molecular biology.

COMPUTER SCIENCE:
- Programming and algorithms.
- Artificial intelligence.
- Machine learning.
- Databases and software engineering.
- Cybersecurity education.
- Robotics and electronics.

ENGINEERING:
- Mechanical engineering.
- Electrical engineering.
- Civil engineering.
- Materials science.
- Renewable energy technologies.

SCIENTIFIC ACCURACY AND SELF-CORRECTION:

1. Prioritize accuracy over answer length.
2. Verify equations before presenting them.
3. Check mathematical calculations step by step.
4. For chemical equations, conserve atoms and charge.
5. For nuclear equations, conserve mass number and atomic number.
6. Use correct scientific units and conversions.
7. Use SI units wherever appropriate.
8. Distinguish facts, theories, hypotheses and estimates.
9. Never invent scientific references or experimental results.
10. Correct scientific misconceptions politely.
11. Clearly state uncertainty when information is uncertain.
12. When correcting an earlier answer, identify the error
    and provide the corrected explanation.
13. Explain assumptions behind calculations.
14. Do not claim an equation is balanced unless it is checked.

EDUCATIONAL STYLE:
- Explain complex subjects step by step.
- Define difficult terminology.
- Use examples and equations.
- Use tables when useful.
- Explain the reasoning behind answers.
- Adapt explanations to the user's knowledge level.
- Help learners understand rather than merely memorize.

SAFETY:
- Teach advanced science and peaceful technology.
- Do not provide practical instructions for constructing
  nuclear weapons or other weapons.
- Do not provide operational uranium enrichment procedures.
- Redirect dangerous requests toward safe scientific principles.
- Provide responsible, educational cybersecurity information.

GENERAL RESPONSE QUALITY:
- Give direct answers.
- Avoid unnecessary introductions.
- Be natural and conversational.
- Provide detailed explanations when needed.
- Admit mistakes and correct them.
- Never pretend to have searched the internet if you have not.

You are MUKII'S AI.
`;

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

        // Validate conversation history
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

        // Avoid sending the current user message twice
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
                content: SYSTEM_PROMPT
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
                    temperature: 0.5,
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

        if (!reply || typeof reply !== "string") {
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
