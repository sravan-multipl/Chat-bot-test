// ---- Element References ----
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const exampleButtons = document.querySelectorAll("[data-text]");
const connectionStatus = document.getElementById("connection-status");

// ---- Config ----
const BASE_URL = "https://adelynn-unallegorical-elmira.ngrok-free.dev";
const BACKEND_URL = `${BASE_URL}/chat`;
const HEALTH_URL = `${BASE_URL}/health`;
const DEFAULT_USER = "PVWDYU";

let backendOnline = false;

// ---- Event Listeners ----
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

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

  if (!backendOnline) {
    appendMessage("bot", "⚠️ Cannot send message — backend is offline.");
    return;
  }

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
    updateConnectionStatus(false);
  }
}

// ---- Append Messages ----
function appendMessage(role, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", role);
  msg.innerHTML = text.replace(/\n/g, "<br>");
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ---- Format Markdown for Bot Replies ----
function appendBotResponse(text, placeholder) {
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold
    .replace(/\n/g, "<br>");
  placeholder.innerHTML = formatted.trim();
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ---- Connection Checker ----
async function checkConnection() {
    try {
      const res = await fetch(HEALTH_URL, { method: "GET" });
      console.log("Health check:", res.status, await res.text());
  
      if (res.ok) {
        // If the backend responds 200, we consider it "online"
        updateConnectionStatus(true);
      } else {
        updateConnectionStatus(false);
      }
    } catch (err) {
      console.error("Health check failed:", err);
      updateConnectionStatus(false);
    }
  }  

// ---- Update UI for Connection ----
function updateConnectionStatus(isOnline) {
  backendOnline = isOnline;
  connectionStatus.textContent = isOnline ? "🟢 Connected to backend" : "🔴 Backend offline";
  connectionStatus.className = isOnline ? "connection-status status-online" : "connection-status status-offline";
}

// ---- Run health check every 10 seconds ----
checkConnection();
setInterval(checkConnection, 10000);
