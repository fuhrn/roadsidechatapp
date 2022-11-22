// con shift control t cambio el nombre al tab title de iterm2

const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv")
const { chats } = require("./data/data");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");


const app = express();

// vamos a recibir datos desde el cliente en formato json
app.use(express.json());
// no es necesario usar urlencoded con node v 16
// app.use(express.urlencoded({ extended: true }));

dotenv.config();
connectDB();

app.get('/', (req, res) => {
  res.send("API is running");
})

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000

app.listen(PORT, console.log(`Server started on Port ${PORT}`.yellow))