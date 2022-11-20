const express = require("express");
const dotenv = require("dotenv")
const { chats } = require("./data/data");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
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

app.use('/api/user', userRoutes)

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000

app.listen(PORT, console.log(`Server started on Port ${PORT}`.yellow))