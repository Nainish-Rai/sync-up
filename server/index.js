// Import the necessary modules
const express = require("express"); // Import the Express module
const app = express(); // Create an instance of the Express application
const http = require("http"); // Import the HTTP module
const server = http.createServer(app); // Create an HTTP server using the Express application
const { Server } = require("socket.io"); // Import the Socket.IO Server class
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
}); // Create a new instance of the Socket.IO server and attach it to the HTTP server
const PORT = process.env.PORT || 8000; // Set the port number

// Create two maps to establish a mapping between email/username and socket
const usernameToSocketMap = new Map(); // Map to store the mapping between email/username and socket
const socketToUsernameMap = new Map(); // Map to store the mapping between socket and email/username

// Event listener for when a client connects to the Socket.IO server
io.on("connection", (socket) => {
  console.log("a user connected" + socket.id); // Log that a user has connected, along with their socket ID

  // Event listener for when a client sends a "room:join" event
  socket.on("room:join", async (data) => {
    const { username, room } = data; // Extract the username and room from the data
    console.log(username, room); // Log the username and room
    usernameToSocketMap.set(username, socket); // Map the username to the socket
    socketToUsernameMap.set(socket, username); // Map the socket to the username
    socket.join(room); // Make the socket join the specified room
    io.to(room).emit("user:joined", { username, id: socket.id });
    io.to(socket.id).emit("room:join", {
      username,
      room,
    });

    socket.on("msg:send", (data) => {
      io.to(room).emit("msg:send", data);
    });

    socket.on("user:call", ({ to, offer }) => {
      io.to(to).emit("incoming:call", { from: room, offer });
    });

    socket.on("call:accepted", ({ to, ans }) => {
      io.to(to).emit("call:accepted", { from: room, ans });
    });

    socket.on("peer:nego:needed", ({ to, offer }) => {
      io.to(to).emit("peer:nego:needed", { from: room, offer });
    });
    socket.on("peer:nego:done", ({ to, ans }) => {
      io.to(to).emit("peer:nego:final", { from: room, ans });
    });
  });
});

// Start the server and listen on the specified port
server.listen(PORT, () => {
  console.log("listening on " + PORT); // Log that the server is listening on the specified port
});
