const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

// Production port
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.status(200).send("U Chat Server is live and running!");
});

io.on("connection", (socket) => {
  console.log("New user connected: " + socket.id);

  socket.on("message", (data) => {
    console.log("Received message:", data);
    // Broadcast to all
    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
