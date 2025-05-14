const express = require("express");
// const morgan = require("morgan");
const dotenv = require("dotenv");
const http = require("http"); // Import http module
const { Server } = require("socket.io"); // Import Socket.io
const setupSocket = require("./config/socket");
const cors = require("cors");
const connectDB = require("./config/db");
// const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
// const orderRoutes = require("./routes/orderRoutes");
// const { notFound } = require("./middleware/errorMiddleware");
// const { errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = setupSocket(server);

// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }

app.use(express.json());

app.use(cors());
app.set("io", io);
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
  next();
});

// make a route folder in future
app.get("/", (req, res) => {
  res.send("API is running");
});

// app.use("/products", productRoutes);
app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
// app.use("/orders", orderRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, console.log(`server running on port ${PORT}`));
