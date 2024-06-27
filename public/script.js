const socket = io();

let currentUser;

document.getElementById("join-btn").addEventListener("click", () => {
  const username = document.getElementById("username").value;
  const room = document.getElementById("room").value;

  if (username && room) {
    currentUser = username;
    socket.emit("joinRoom", { username, room });
    document.getElementById("login-modal").style.display = "none";
    document.getElementById("chat-container").classList.remove("hidden");
    document.getElementById("room-name").innerText = room;
  }
});

function messageSend() {
  const message = document.getElementById("message").value;
  const room = document.getElementById("room").value;

  if (message) {
    socket.emit("sendMessage", { username: currentUser, room, message });
    document.getElementById("message").value = "";
  }
}

document.getElementById("message").onkeyup = function (event) {
  if (event.keyCode === 13) {
    messageSend();
  }
};

document.getElementById("send-btn").addEventListener("click", () => {
  messageSend();
});

document.getElementById("image-input").addEventListener("change", () => {
  const room = document.getElementById("room").value;
  const imageInput = document.getElementById("image-input");
  const formData = new FormData();
  formData.append("image", imageInput.files[0]);

  fetch("/upload/image", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      socket.emit("sendImage", { username: currentUser, room, url: data.url });
    });
});

document.getElementById("voice-input").addEventListener("change", () => {
  const room = document.getElementById("room").value;
  const voiceInput = document.getElementById("voice-input");
  const formData = new FormData();
  formData.append("voice", voiceInput.files[0]);

  fetch("/upload/voice", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      socket.emit("sendVoice", { username: currentUser, room, url: data.url });
    });
});

socket.on("message", (data) => {
  addMessage(
    data.username,
    data.text,
    data.username === currentUser ? "right" : "left"
  );
});

socket.on("image", (data) => {
  addMessage(
    data.username,
    `<img src="${data.url}" width="200" />`,
    data.username === currentUser ? "right" : "left"
  );
});

socket.on("voice", (data) => {
  addMessage(
    data.username,
    `<audio controls src="${data.url}"></audio>`,
    data.username === currentUser ? "right" : "left"
  );
});

function addMessage(username, content, side) {
  const output = document.getElementById("output");
  const messageElement = document.createElement("p");
  if (username === "System") {
    messageElement.innerHTML = `<div id="system-message"><div>${content}</div></div>`;
  } else {
    messageElement.innerHTML = `<div>
      <div id="message-sender">${username}</div> <div>${content}</div>
      </div>`;
    messageElement.classList.add(`message-${side}`);
  }
  output.appendChild(messageElement);

  const chatWindow = document.getElementById("chat-window");
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
