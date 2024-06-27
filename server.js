const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Set up storage for images and voice notes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(
      __dirname,
      "public",
      "uploads",
      file.mimetype.split("/")[0]
    );
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.use(express.static("public"));

// Routes to handle file uploads
app.post("/upload/image", upload.single("image"), (req, res) => {
  res.json({ url: `/uploads/image/${req.file.filename}` });
});

app.post("/upload/voice", upload.single("voice"), (req, res) => {
  res.json({ url: `/uploads/audio/${req.file.filename}` });
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinRoom", ({ username, room }) => {
    socket.join(room);
    socket.broadcast.to(room).emit("message", {
      username: "System",
      text: `${username} has joined the room`,
    });
  });

  socket.on("sendMessage", ({ username, room, message }) => {
    io.to(room).emit("message", { username, text: message });
  });

  socket.on("sendImage", ({ username, room, url }) => {
    io.to(room).emit("image", { username, url });
  });

  socket.on("sendVoice", ({ username, room, url }) => {
    io.to(room).emit("voice", { username, url });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
