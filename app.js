const express = require("express");
const { DB } = require("./components/db");
const dotenv = require("dotenv");
const cors = require("cors");
const authenticate = require("./middlewares/authenticate");
const auth = require("./routes/auth");
const user = require("./routes/user");
const cookieParser = require("cookie-parser");

//config
dotenv.config({ path: "./.env" });

const database = new DB();
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "http://localhost:3000" } });

database.connect();

//MiddlewareT 1 + 1
var whitelist = ["http://localhost:3000" /** other domains if any */];
var corsOptions = {
  credentials: true,
  origin: "http://localhost:3000",
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

io.on("connection", (socket) => {
  console.log("a user connected");
});

//Routes
app.use("/api/user", user(database));
app.use("/api/auth", auth(database));
app.get("/api/auth/check", authenticate, async (req, res) => {
  res.json({ success: true, data: req.user.username });
});

let users = [];

const addUser = (username, socketId) => {
  !users.some((user) => user.username === username) &&
    users.push({ username, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (reciver) => {
  return users.find((user) => user.username === reciver);
};

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("addUser", (username) => {
    addUser(username, socket.id);
    io.emit("getUsers", users);
  });

  socket.on("sendMessage", ({ username, recivername, text }) => {
    const user = getUser(recivername);
    if (user)
      io.to(user.socketId).emit("getMessage", {
        username,
        text,
      });
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

server.listen(process.env.PORT, () =>
  console.log(`Server Listening on ${process.env.PORT}`)
);
