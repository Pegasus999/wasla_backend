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
import { disconnect } from "./Controllers/driversController";
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

// Client Routes
const client = require("./Routes/client");
app.use("/api/client", client);

app.post("/test", async (req: Request, res: Response) => {
  try {
    const drivers = await db.driver.findMany({});
    res.status(200).json({ drivers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An Error Occured" });
  }
});

const server = createServer(app);
const io = new Server(server);

const port = 5000;

server.listen(port, () => {
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

  socket.on("updateLocation", async (data) => {
    await updateLocation(socket, data);
  });

  socket.on("rideEnd", async (data) => {
    console.log("here");
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

  socket.on("disconnect", async (data) => {
    const id = getKeyByValue(connections, socket.id);
    console.log(id);
    await disconnect(id);
    socket.emit("disconnected", id);
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

function getKeyByValue(map: any, targetValue: any) {
  for (const [key, value] of map.entries()) {
    if (value === targetValue) {
      return key; // Return the key when the value matches the targetValue
    }
  }
  // If the value is not found, you can return null or handle it as needed
  return null;
}
