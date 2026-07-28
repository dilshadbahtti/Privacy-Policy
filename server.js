const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

// --- MONGODB SETUP ---
// Replace with your MongoDB Atlas Connection String
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://dilshadirshad599_db_user:uDa8g1Sd6hbwEEvW@dilshad.rdbpj9u.mongodb.net/?appName=DILSHAD";

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const messageSchema = new mongoose.Schema({
  text: String,
  senderId: String,
  timestamp: { type: Number, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);
// ----------------------

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.status(200).send("U Chat Server is live and running!");
});

io.on("connection", async (socket) => {
  console.log("New user connected: " + socket.id);

  // Send last 50 messages to newly connected user
  try {
    const history = await Message.find().sort({ timestamp: 1 }).limit(50);
    socket.emit("chat_history", history);
  } catch (err) {
    console.error("Error fetching history:", err);
  }

  socket.on("message", async (data) => {
    console.log("Received message:", data);

    // Save to Database
    const newMessage = new Message({
      text: data.text,
      senderId: data.senderId,
      timestamp: data.timestamp || Date.now()
    });

    try {
      await newMessage.save();
      // Broadcast to all except sender (sender adds locally)
      socket.broadcast.emit("message", data);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
