// ===============================
// Telegram + Express Server Setup
// ===============================

const express = require("express");
const webSocket = require("ws");
const http = require("http");
const telegramBot = require("node-telegram-bot-api");
const uuid4 = require("uuid");
const multer = require("multer");
const bodyParser = require("body-parser");
const axios = require("axios");

// ===============================
// Telegram Bot Configuration
// ===============================
// ⚠️ Render এ BOT_TOKEN আর CHAT_ID Environment Variable হিসেবে যোগ করবে
// Dashboard → Environment → Add Environment Variable

const token = process.env.BOT_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN";
const id = process.env.CHAT_ID || "YOUR_CHAT_ID";

// ===============================
// Server and Middleware Setup
// ===============================

const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({ server: appServer });
const appBot = new telegramBot(token, { polling: true });
const appClients = new Map();

const upload = multer();
app.use(bodyParser.json());

// ===============================
// Default Route
// ===============================

app.get("/", (req, res) => {
  res.send("<h1 align='center'>✅ Server uploaded successfully</h1>");
});

// ===============================
// File Upload Route
// ===============================

app.post("/uploadFile", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file received" });
    }
    const name = req.file.originalname;
    await appBot.sendDocument(id, req.file.buffer, {}, { filename: name });
    res.json({ success: true, message: "File sent to Telegram successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, error: error.message });
  }
});

// ===============================
// JSON Message Sending Route
// ===============================

app.post("/sendMessage", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.json({ success: false, error: "No message provided" });

    await appBot.sendMessage(id, `📩 New Message:\n${text}`);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.json({ success: false, error: error.message });
  }
});

// ===============================
// WebSocket Setup (optional)
// ===============================

appSocket.on("connection", (socket) => {
  console.log("New WebSocket client connected ✅");
  socket.on("message", (msg) => {
    console.log("Message from client:", msg.toString());
  });
  socket.on("close", () => {
    console.log("WebSocket client disconnected ❌");
  });
});

// ===============================
// Start Server (Render Compatible)
// ===============================

const PORT = process.env.PORT || 3000;
appServer.listen(PORT, () => {
  console.log(`🚀 Server running successfully on port ${PORT}`);
});