const socket = io(); // Connect to the server
const messageForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message");
const messageList = document.getElementById("messages");
// const fileInput = document.getElementById("file-input");



socket.on("chat message", (msg) => {
  const li = document.createElement("li");
  li.textContent = msg;
  messageList.appendChild(li);
});

// Handle chat message submission
messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const msg = messageInput.value;
  socket.emit("chat message", msg);
  messageInput.value = "";
});

