const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { log } = require("console");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow frontend to connect
  },
});

app.use(cors());

let users = []; // Store unique users

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle new chat messages
  socket.on("chat", (chat) => {
    io.emit("chat", chat);
  });

 
  // Handle new users joining
  socket.on("users", (newUser) => {
    if (!newUser || !newUser.username) return;

    // Check for duplicate usernames
    let username = newUser.username;
    let counter = 1;

    while (users.some((user) => user.username === username)) {
      username = `${newUser.username}(${counter})`;
      counter++;
    }

    const uniqueUser = { ...newUser, username };
    users.push(uniqueUser);
    io.emit("users", users);
  });

  // Listen for user joining
  socket.on("userJoined", ({ username, socketId }) => {
    if (socketId && username) {
      // Add user to the users array
      users.push({ username, socketId });
      console.log("User joined:", users);
      io.emit("users", users); // Emit the updated user list to all clients
    }
  });

 // Handle user disconnecting
 socket.on("disconnect", () => {
    users = users.filter(user => user.socketId !== socket.id);
    io.emit("users", users); // Emit updated user list after disconnect
    console.log('User disconnected', socket.id);
    console.log("User :", users);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
