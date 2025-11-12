// ---- Element References ----
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const exampleButtons = document.querySelectorAll("[data-text]");

// ---- Config ----
const BACKEND_URL = "https://adelynn-unallegorical-elmira.ngrok-free.dev/chat";
const DEFAULT_USER = "PVWDYU";

// ---- Event Listeners ----
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// ✅ Intent / Example Buttons
exampleButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const text = btn.dataset.text;
    userInput.value = text;
    sendMessage();
  });
});

// ---- Core Message Logic ----
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage("user", text);
  userInput.value = "";

  appendMessage("bot", "⏳ Thinking...");
  const placeholder = chatBox.lastChild;

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: DEFAULT_USER,
        text: text,
      }),
    });

    if (!res.ok) {
      placeholder.textContent = `⚠️ Server returned ${res.status}`;
      console.error("Fetch error:", res.status, await res.text());
      return;
    }

    const data = await res.json();
    const botReply = data.message || data.reply || "⚠️ No reply field in response.";
    appendBotResponse(botReply, placeholder);
  } catch (err) {
    console.error("Network/error:", err);
    placeholder.textContent = "⚠️ Could not reach backend.";
  }
}

// ---- Helper: Append Messages ----
function appendMessage(role, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", role);

  msg.innerHTML = text.replace(/\n/g, "<br>");
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ---- Helper: Format Markdown for Bot Replies ----
function appendBotResponse(text, placeholder) {
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // **bold**
    .replace(/\n/g, "<br>"); // line breaks

  placeholder.innerHTML = formatted.trim();
  chatBox.scrollTop = chatBox.scrollHeight;
}
