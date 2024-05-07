const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const path = require("path");

const messages = [];
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.json()); // <==== parse request body as JSON

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.emit("messages", messages);
  socket.on("chat message", (msg) => {
    messages.push(msg);
    io.emit("chat message", msg);
    // console.log(msg)
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

http.listen(4000, () => {
  console.log("Listening on port 4000");
});
