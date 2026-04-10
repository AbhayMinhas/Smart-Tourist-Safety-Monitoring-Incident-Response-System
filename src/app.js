import express from "express";
import connectDB from "./config/database.js";
const app = express();
import "dotenv/config";
import router from "./routes/index.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { verifyEmailConnection } from "./utils/email.service.js";
import {
  saveLocation,
  saveLocationIfNeeded,
} from "./modules/locations/location.service.js";
import User from "./modules/auth/auth.model.js";
import jwt from "jsonwebtoken";

import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import http from "http";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname,"public")));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id).select("_id firstName");

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});

import { userLocations } from "./utils/locationCache.js";
io.on("connection", (socket) => {
  const userName = socket.user.firstName;

  console.log("User connected:", socket.id, "User: ", userName);

  socket.on("send-location", async (data) => {
    try {
      const { latitude, longitude } = data;
      //store in memory

      if (!latitude || !longitude) return;
      const userId = socket.user._id.toString();

      userLocations.set(userId, {
        latitude,
        longitude,
        name: userName,
        socketId: socket.id,
        timestamp: Date.now(),
      });

      console.log("Live Location:", userId, latitude, longitude);

      saveLocationIfNeeded({
        userId,
        lat: latitude,
        lng: longitude,
      }).catch((err) => {
        console.error("location save error:", err.message);
      });

      // broadcast to others (optional)
      socket.broadcast.emit("receive-location", {
        userId,
        latitude,
        longitude,
      });
    } catch (error) {
      console.error("Socket error: ", error.message);
    }
  });

  socket.on("disconnect", async () => {
    const userId = socket.user._id.toString();
    const last = userLocations.get(userId);

    if (last) {
      await saveLocation(userId, last.latitude, last.longitude);
    }
    console.log("User disconnected: ", socket.id);
  });
});

app.use("/api", router);

app.use(errorHandler);

connectDB()
  .then(async () => {
    console.log("DB connection established");

    await verifyEmailConnection();

    server.listen(process.env.PORT, () => {
      console.log("Server is listening on port " + process.env.PORT);
    });
  })
  .catch((err) => {
    console.log("DB cannot be Connected" + err);
  });
