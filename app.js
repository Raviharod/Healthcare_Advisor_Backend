const dotenv = require("dotenv");
dotenv.config();
const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");


const dbConnect = require("./src/config/db");
const User = require("./src/models/patient");
const sessionMiddleware = require("./src/middlewares/session");
const symptomsRoutes = require("./src/routes/symptomsRoutes");
const userRoutes = require("./src/routes/userRoutes");
const healthRecordsRoutes = require("./src/routes/healthRecordsRoutes");
const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://healthcare-advisor-frontend-hzr1sqi11.vercel.app/",
    methods: ["GET", "POST"],
    credentials: true,
  },
});


// Middleware
app.use(sessionMiddleware);
app.use(
  cors({
    origin: "https://healthcare-advisor-frontend-hzr1sqi11.vercel.app/",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// middlewares
app.use(symptomsRoutes);
app.use(userRoutes);
app.use(healthRecordsRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("✅ Server is running...");
});


global.onlineUsers = new Map();

// Socket.io connections
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
   socket.on("onlineUser", (user)=>{
    console.log("user recieved via socket", user);
    onlineUsers.set(user.id, {
      socketId: socket.id,
      name: user.name,
    });
    // console.log(Array.from(global.onlineUsers))
    io.emit("onlineUsers", Array.from(global.onlineUsers) );
   })

  socket.on("invitation", (invitationData)=>{
    console.log("📨 Invitation received from patient:", invitationData);
    const { doctorSocketId, patientName, patientSocketId, patientId } = invitationData;
    
    // Send invitation to the specific doctor only
    if (doctorSocketId) {
      // Check if the socket exists
      const doctorSocket = io.sockets.sockets.get(doctorSocketId);
      if (doctorSocket) {
        console.log("✅ Doctor socket found, sending invitation to:", doctorSocketId);
        io.to(doctorSocketId).emit("video-invitation-received", {
          patientName,
          patientSocketId,
          patientId,
          invitationId: `${patientId}-${Date.now()}` // Unique invitation ID
        });
        console.log("📤 Video invitation sent to doctor socket:", doctorSocketId);
      } else {
        console.error("❌ Doctor socket not found:", doctorSocketId);
        console.log("Available sockets:", Array.from(io.sockets.sockets.keys()));
      }
    } else {
      console.error("❌ Doctor socket ID not provided in invitation");
    }
  })

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  socket.on("offer", (data) => {
    const { invitationData } = data;
    const { doctorSocketId } = invitationData;
    console.log("Offer received from patient:", invitationData);
    // Send the offer directly to the doctor socket and include sender id for reply
    io.to(doctorSocketId).emit("offer", {
      offer: data.offer,
      doctorSocketId,
      patientSocketId: socket.id
    });
  });

  socket.on("answer", (data) => {
    console.log("answer came from:", data.doctorSocketId, "to:", data.patientSocketId);
    if (data.patientSocketId) {
      io.to(data.patientSocketId).emit("answer", { answer: data.answer, patientSocketId: data.patientSocketId, doctorSocketId:data.doctorSocketId });
    }
  });

  socket.on("ice-candidate", (data) => {
    if (data.targetSocketId) {
      io.to(data.targetSocketId).emit("ice-candidate", { candidate: data.candidate, senderId: socket.id });
    }
  });

  // ----------- VIDEO INVITATION EVENTS -------------
  socket.on("video-invitation", (data) => {
    const { doctorSocketId, patientName, patientSocketId, patientId } = data;
    console.log("Video invitation sent to doctor:", doctorSocketId);
    
    // Send invitation to the specific doctor
    io.to(doctorSocketId).emit("video-invitation-received", {
      patientName,
      patientSocketId,
      patientId,
      invitationId: `${patientId}-${Date.now()}` // Unique invitation ID
    });
  });

  socket.on("video-invitation-accepted", (data) => {
    const { patientSocketId, doctorName, doctorSocketId} = data;
    console.log("Invitation accepted from doctor ,", doctorSocketId);
    
    // Notify patient that invitation was accepted
    io.to(patientSocketId).emit("video-invitation-accepted", {
      doctorName,
      doctorSocketId,
    });
    
    // Also notify doctor
    io.to(doctorSocketId).emit("join-video-room", {
      patientSocketId
    });
  });

  socket.on("start-video-call", (data) => {
    const { patientSocketId, doctorName, doctorSocketId } = data;
    console.log("Starting video call...");
    io.to(patientSocketId).emit("start-video-call", {
      patientSocketId,
      doctorName,
      doctorSocketId,
    });
  });

  socket.on("video-invitation-rejected", (data) => {
    const { patientSocketId, doctorName } = data;
    console.log("Invitation rejected by doctor:", doctorName);
    
    // Notify patient that invitation was rejected
    io.to(patientSocketId).emit("video-invitation-rejected", {
      doctorName
    });
  });

  socket.on("disconnect", () => {
    // Remove user from onlineUsers when they disconnect
    for (const [userId, userData] of onlineUsers.entries()) {
      if (userData.socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("user-disconnected", socket.id);
    console.log("User disconnected:", socket.id);
  });
});


dbConnect(() => {
  server.listen(PORT, () => {
    console.log("🚀 Server listening at http://localhost:8080");
  });
});
