const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

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

        const response = await fetch("http://localhost:11434/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3.2",
                messages: [
                    {
                        role: "system",
                        content: "Wewe ni MUKII'S AI. Jibu kwa Kiswahili kwa urafiki, kwa uelewa na kwa kusaidia."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama error: ${response.status}`);
        }

        const data = await response.json();

        res.json({
            reply: data.message.content
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "MUKII'S AI haijaweza kuwasiliana na Ollama."
        });
    }
});

app.listen(PORT, () => {
    console.log(`MUKII'S AI server iko kwenye http://localhost:${PORT}`);
});