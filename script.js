const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// ✅ Backend endpoint
const BACKEND_URL = "https://adelynn-unallegorical-elmira.ngrok-free.dev/chat";

// ✅ Default user id expected by backend
const DEFAULT_USER = "PVWDYU";

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage("user", text);
  userInput.value = "";

  // show thinking placeholder and keep a reference to it
  appendMessage("bot", "⏳ Thinking...");
  const placeholder = chatBox.lastChild;

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: DEFAULT_USER, // <-- important: matches backend model
        text: text,
      }),
    });

    if (!res.ok) {
      // show readable error in UI
      const textErr = `⚠️ Server returned ${res.status} ${res.statusText}`;
      placeholder.textContent = textErr;
      console.error(`Fetch error: ${res.status}`, await res.text());
      return;
    }

    // try to parse JSON safely
    let data;
    try {
      data = await res.json();
    } catch (parseErr) {
      placeholder.textContent = "⚠️ Invalid JSON from server.";
      console.error("Invalid JSON response:", parseErr);
      return;
    }

    const botReply = data.message || data.reply || "⚠️ No reply field in response.";
    placeholder.textContent = botReply;
  } catch (err) {
    console.error("Network/error:", err);
    placeholder.textContent = "⚠️ Could not reach backend.";
  }
}

function appendMessage(role, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", role);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
