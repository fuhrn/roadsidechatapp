const express = require("express");
const dotenv = require("dotenv")
const { chats } = require("./data/data");
const connectDB = require("./config/db");
const colors = require("colors");

const app = express();
dotenv.config();
connectDB();

app.get('/', (req, res) => {
  res.send("API is running");
})

app.get("/api/chat", (req, res) => {
  res.send(chats);
});

app.get("/api/chat/:id", (req, res) => {
  const singleChat = chats.find((chat) => chat._id === req.params.id)
  res.send(singleChat);
});

const PORT = process.env.PORT || 4000

app.listen(PORT, console.log(`Server started on Port ${PORT}`.yellow))