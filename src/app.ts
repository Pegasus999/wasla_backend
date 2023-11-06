import { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import {
  acceptRequest,
  cancelRide,
  endRide,
  rideRequest,
  updateLocation,
} from "./Controllers/taxiController";
import { PrismaClient, Trip } from "@prisma/client";
import {
  acceptTowRequest,
  cancelTow,
  towRequest,
  updateTowLocation,
} from "./Controllers/towController";

let db = new PrismaClient();
const express = require("express");

const app = express();
app.use(express.json());

// Auth Routes
const auth = require("./Routes/auth");
app.use("/api/auth", auth);

// Shop Routes
const shop = require("./Routes/shop");
app.use("/api/shop", shop);

// Driver Routes
const driver = require("./Routes/drivers");
app.use("/api/driver", driver);

app.post("/test", async (req: Request, res: Response) => {
  try {
    let date = new Date();
    console.log(date.toLocaleString());
    res.status(200).json(date);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

const server = createServer(app);
const io = new Server(server);

const port = 5000;

server.listen(port, "192.168.201.133", () => {
  console.log(`Server listening on ${port}`);
});

declare global {
  var connections: Map<any, any>; // Replace 'any' with the actual types you are using in the Map
}

global.connections = new Map();

io.on("connection", (socket) => {
  socket.on("rideRequest", async (data) => {
    await rideRequest(socket, data);
  });

  socket.on("rideAccept", async (data) => {
    await acceptRequest(socket, data);
  });

  socket.on("driverLocationUpdate", async (data) => {
    await updateLocation(socket, data);
  });

  socket.on("rideEnd", async (data) => {
    await endRide(socket, data);
  });

  socket.on("rideCancel", async (data) => {
    await cancelRide(socket, data);
  });

  socket.on("towRequest", async (data) => {
    await towRequest(socket, data);
  });

  socket.on("towAccept", async (data) => {
    await acceptTowRequest(socket, data);
  });

  socket.on("towLocationUpdate", async (data) => {
    await updateTowLocation(socket, data);
  });

  socket.on("towCancel", async (data) => {
    await cancelTow(socket, data);
  });

  socket.on("add", (data) => {
    connections.set(data.userId, socket.id);
    console.log(connections);
    socket.emit("added");
  });

  socket.on("re-add", (data) => {
    connections.delete(data.userId);
    connections.set(data.userId, socket.id);
  });
});
