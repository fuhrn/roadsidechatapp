// con shift control t cambio el nombre al tab title de iterm2

const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
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

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

const server = app.listen(
  PORT,
  console.log(`Server started on Port ${PORT}`.yellow)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

// io is a Socket.IO server instance attached to an instance of http.Server listening for incoming events.
// Ahora necesitamos que el servidor de websockets, que lo tenemos en la variable io, esté atento a que se realice una conexión. Eso lo logramos con io.on()
// The socket argument of the connection event listener callback function is an object that represents an incoming socket connection from a client.
// a new socket gets created whenever a new user connects to the io (that is set up with your server),
io.on("connection", (socket) => {
  // console.log("connected to socket.io")

  // creando un room (chat space) para un user llamado "userData"
  socket.on("setup", (userData) => {
    // socket.join lo uso cuando quiero unir el socket a un room, que en este caso, el room se llama igual al id del user
    socket.join(userData._id);
    socket.emit("connected");
  });

  // cada socket representa una conexion de un usuario a la aplicacion.
  // cada socket entonces puede estar asociada a multiples rooms simultaneamente
  // por lo tanto 2 o mas sockets pueden estar unidos en la misma room
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joined room: " + room);
  });

  socket.on("typing", (room) => socket.to(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    console.log("newMessageReceived from socket: ", newMessageRecieved);

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      // socket.in sinonimo de socket.to
      // Sets a modifier ('to' / 'in') for a subsequent event emission that the event will only be broadcast to clients that have joined the given room
      // me parece no es necesario hacer este forEach, pues automaticamente el mensaje NO es enviado al sender
      socket.in(user._id).emit("message received", newMessageRecieved);
    });

    // usamos el mismo evento "setup" para cerrar el socket
    socket.off("setup", () => {
      console.log("USER DISCONNECTED");
      socket.leave(userData._id);
    });
  });
});
