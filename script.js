async function sendMessage() {
    const input = document.getElementById("userInput");
    const chatBox = document.getElementById("chatBox");

    const message = input.value.trim();

    if (message === "") {
        return;
    }

    const userMessage = document.createElement("div");
    userMessage.className = "message user-message";
    userMessage.textContent = message;
    chatBox.appendChild(userMessage);

    input.value = "";

    chatBox.scrollTop = chatBox.scrollHeight;

    const aiMessage = document.createElement("div");
    aiMessage.className = "message ai-message";
    aiMessage.textContent = "MUKII'S AI inafikiria... 🤖";
    chatBox.appendChild(aiMessage);
     saveChat();
    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
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
            "MUKII'S AI bado haina API key. 🤖";
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}


// KUTUMA UJUMBE KWA KUBONYEZA ENTER
document.addEventListener("DOMContentLoaded", function () {

    const input = document.getElementById("userInput");

    input.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }

    });

});// Hifadhi chat kwenye browser
function saveChat() {
function saveChat() {
    const chatBox = document.getElementById("chatBox");
    localStorage.setItem("mukiiChat", chatBox.innerHTML);
}/ Rudisha chat iliyohifadhiwa
document.addEventListener("DOMContentLoaded", function () {
    const savedChat = localStorage.getItem("mukiiChat");

    if (savedChat) {
        document.getElementById("chatBox").innerHTML = savedChat;
    }
});