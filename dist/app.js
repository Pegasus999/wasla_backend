"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const taxiController_1 = require("./Controllers/taxiController");
const client_1 = require("@prisma/client");
const towController_1 = require("./Controllers/towController");
let db = new client_1.PrismaClient();
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
app.post("/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let date = new Date();
        console.log(date.toLocaleString());
        res.status(200).json(date);
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}));
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server);
const port = 5000;
server.listen(port, () => {
    console.log(`Server listening on ${port}`);
});
global.connections = new Map();
io.on("connection", (socket) => {
    socket.on("rideRequest", (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, taxiController_1.rideRequest)(socket, data);
    }));
    socket.on("rideAccept", (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, taxiController_1.acceptRequest)(socket, data);
    }));
    socket.on("driverLocationUpdate", (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, taxiController_1.updateLocation)(socket, data);
    }));
    socket.on("rideEnd", (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, taxiController_1.endRide)(socket, data);
    }));
    socket.on("rideCancel", (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, taxiController_1.cancelRide)(socket, data);
    }));
    socket.on("towRequest", (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, towController_1.towRequest)(socket, data);
    }));
    socket.on("towAccept", (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, towController_1.acceptTowRequest)(socket, data);
    }));
    socket.on("towLocationUpdate", (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, towController_1.updateTowLocation)(socket, data);
    }));
    socket.on("towCancel", (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, towController_1.cancelTow)(socket, data);
    }));
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
//# sourceMappingURL=app.js.map