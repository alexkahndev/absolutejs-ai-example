const WS_OPEN = 1;
let provider = "anthropic";
let conversationId = crypto.randomUUID();
let isStreaming = false;
let currentMessageEl: HTMLElement | null = null;

const messagesEl = document.getElementById("messages")!;
const form = document.getElementById("chat-form") as HTMLFormElement;
const input = form.elements.namedItem("input") as HTMLInputElement;

const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const wsUrl = `${protocol}//${window.location.host}/chat`;
let socket = new WebSocket(wsUrl);

const providerButtons = document.querySelectorAll<HTMLButtonElement>(
  ".provider-selector button",
);

for (const btn of providerButtons) {
  btn.addEventListener("click", () => {
    provider = btn.dataset.provider ?? "anthropic";

    for (const other of providerButtons) {
      other.classList.remove("active");
    }

    btn.classList.add("active");
    input.placeholder = `Ask ${provider} anything...`;
  });
}

const clearEmptyState = () => {
  const empty = messagesEl.querySelector(".empty-state");

  if (empty) {
    empty.remove();
  }
};

const addUserMessage = (content: string) => {
  clearEmptyState();
  const div = document.createElement("div");
  div.className = "message";
  div.dataset.role = "user";
  div.textContent = content;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
};

const getOrCreateAssistantMessage = () => {
  if (currentMessageEl) {
    return currentMessageEl;
  }

  const div = document.createElement("div");
  div.className = "message";
  div.dataset.role = "assistant";
  messagesEl.appendChild(div);
  currentMessageEl = div;

  return div;
};

const setStreaming = (streaming: boolean) => {
  isStreaming = streaming;
  input.disabled = streaming;
  const btn = form.querySelector("button")!;
  btn.textContent = streaming ? "Stop" : "Send";
  btn.type = streaming ? "button" : "submit";

  if (streaming) {
    btn.classList.add("cancel");
    btn.onclick = () => {
      socket.send(JSON.stringify({ conversationId, type: "cancel" }));
    };
  } else {
    btn.classList.remove("cancel");
    btn.onclick = null;
  }
};

socket.onmessage = (event: MessageEvent) => {
  const msg = JSON.parse(String(event.data));

  if (msg.type === "chunk") {
    const el = getOrCreateAssistantMessage();
    el.textContent = (el.textContent ?? "") + msg.content;
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  if (msg.type === "tool_status") {
    const el = getOrCreateAssistantMessage();
    const toolDiv = document.createElement("div");
    toolDiv.className = `tool-status ${msg.status === "running" ? "running" : ""}`;
    toolDiv.textContent =
      msg.status === "complete"
        ? `${msg.name}: ${msg.result}`
        : `Running ${msg.name}...`;
    el.appendChild(toolDiv);
  }

  if (msg.type === "complete") {
    currentMessageEl = null;
    setStreaming(false);
  }

  if (msg.type === "error") {
    currentMessageEl = null;
    setStreaming(false);
    const div = document.createElement("div");
    div.className = "tool-status running";
    div.textContent = `Error: ${msg.message}`;
    messagesEl.appendChild(div);
  }
};

socket.onclose = () => {
  setTimeout(() => {
    socket = new WebSocket(wsUrl);
  }, 1000);
};

form.addEventListener("submit", (evt: Event) => {
  evt.preventDefault();
  const value = input.value.trim();

  if (!value || socket.readyState !== WS_OPEN) {
    return;
  }

  addUserMessage(value);
  socket.send(
    JSON.stringify({
      content: `${provider}:${value}`,
      conversationId,
      type: "message",
    }),
  );
  input.value = "";
  setStreaming(true);
});
