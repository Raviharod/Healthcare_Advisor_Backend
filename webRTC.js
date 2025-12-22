// const express = require("express")
const {Server} = require("socket.io")

// const app = express();
const io = new Server();

io.on("connection", (socket)=>{
  socket.on("join_room", (data)=>{
    const {email, roomId} = data ;
    console.log(`${email} has joined the room: ${roomId}`);
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user_joined", {email});
   })
})

const ioServer = io.listen(3001, ()=>{
  console.log("webRTC server is listening on port http://localhost:3001");
});

module.exports = ioServer;