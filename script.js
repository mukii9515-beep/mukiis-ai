async function sendMessage() {
    const input = document.getElementById("userInput");
    const chatBox = document.getElementById("chatBox");

    const message = input.value.trim();

    if (message === "") return;

    const userMessage = document.createElement("div");
    userMessage.className = "message user-message";
    userMessage.textContent = message;
    chatBox.appendChild(userMessage);

    input.value = "";

    const aiMessage = document.createElement("div");
    aiMessage.className = "message ai-message";
    aiMessage.textContent = "MUKII'S AI inafikiria... 🤖";
    chatBox.appendChild(aiMessage);

    chatBox.scrollTop = chatBox.scrollHeight;
    saveChat();

    // Kusoma historia ya mazungumzo
    const history = Array.from(
        chatBox.querySelectorAll(".user-message, .ai-message")
    )
    .filter(element =>
        element.textContent !== "MUKII'S AI inafikiria... 🤖"
    )
    .map(element => ({
        role: element.classList.contains("user-message")
            ? "user"
            : "assistant",
        content: element.textContent
    }))
    .slice(-20);

    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message,
                history: history
            })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Kuna tatizo.");
        }

        aiMessage.textContent = data.reply;
        saveChat();

    } catch (error) {
        console.error(error);
        aiMessage.textContent =
            "Samahani, kuna tatizo la kuwasiliana na server.";
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}

// KUTUMA UJUMBE KWA ENTER
document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("userInput");

    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });

    // KURUDISHA CHAT ILIYOHIFADHIWA
    const savedChat = localStorage.getItem("mukiiChat");

    if (savedChat) {
        document.getElementById("chatBox").innerHTML = savedChat;
    }
});

// KUHIFADHI CHAT
function saveChat() {
    const chatBox = document.getElementById("chatBox");
    localStorage.setItem("mukiiChat", chatBox.innerHTML);
}