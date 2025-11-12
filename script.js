const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// ✅ Select all example buttons
const exampleButtons = document.querySelectorAll("[data-text]");

// ✅ Backend endpoint
const BACKEND_URL = "https://adelynn-unallegorical-elmira.ngrok-free.dev/chat";

// ✅ Default user id expected by backend
const DEFAULT_USER = "PVWDYU";

// ---- Event Listeners ---- //
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// ✅ Add click listeners for all buttons with data-text
exampleButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const text = btn.dataset.text;
    userInput.value = text;
    sendMessage(); // auto send
  });
});

// ---- Core Message Logic ---- //
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
        user_id: DEFAULT_USER, // ✅ matches backend model
        text: text,
      }),
    });

    if (!res.ok) {
      placeholder.textContent = `⚠️ Server returned ${res.status} ${res.statusText}`;
      console.error("Fetch error:", res.status, await res.text());
      return;
    }

    const data = await res.json();
    const botReply =
      data.message || data.reply || "⚠️ No reply field in response.";
    placeholder.textContent = botReply;
  } catch (err) {
    console.error("Network/error:", err);
    placeholder.textContent = "⚠️ Could not reach backend.";
  }
}

function appendMessage(role, text) {
    const msg = document.createElement("div");
    msg.classList.add("message", role);
  
    // --- Markdown formatting ---
    let formatted = text
      // Convert **bold** → <strong>
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Convert numbered lists like 1. item → <br>1. item
      .replace(/(\d+\.\s)/g, "<br>$1")
      // Convert dashes to new lines for readability
      .replace(/-\s/g, " - ")
      // Convert newlines to <br>
      .replace(/\n/g, "<br>");
  
    msg.innerHTML = formatted.trim();
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  
  
