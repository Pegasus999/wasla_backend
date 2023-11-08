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
exports.cancelTow = exports.acceptTowRequest = exports.updateTowLocation = exports.towRequest = void 0;
const client_1 = require("@prisma/client");
let db = new client_1.PrismaClient();
function calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371; // Radius of the Earth in kilometers
    const radiansLat1 = (Math.PI / 180) * lat1;
    const radiansLat2 = (Math.PI / 180) * lat2;
    const radiansLon1 = (Math.PI / 180) * lon1;
    const radiansLon2 = (Math.PI / 180) * lon2;
    const distance = Math.acos(Math.sin(radiansLat1) * Math.sin(radiansLat2) +
        Math.cos(radiansLat1) *
            Math.cos(radiansLat2) *
            Math.cos(radiansLon2 - radiansLon1)) * earthRadius;
    return distance;
}
const lookForDriver = (latitude, longtitude) => __awaiter(void 0, void 0, void 0, function* () {
    const drivers = yield db.driver.findMany({
        where: { type: "tow", active: true },
    });
    let nearbyDrivers = [];
    let km = 5;
    while (nearbyDrivers.length == 0 && km < 50) {
        nearbyDrivers = drivers.filter((driver) => {
            return (calculateDistance(latitude, longtitude, driver.latitude, driver.longtitude) < km);
        });
        km += 5;
    }
    return nearbyDrivers;
});
let clientDrivers = new Map();
const towRequest = (socket, body) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, licensePlate, userId, pickUpLocationLatitude, pickUpLocationLongtitude, } = body;
    const drivers = yield lookForDriver(pickUpLocationLatitude, pickUpLocationLongtitude);
    let ids = drivers.map((driver) => driver.id);
    let connectionIds = ids
        .map((id) => connections.get(id))
        .filter((value) => value != null);
    if (connectionIds.length > 0) {
        clientDrivers.set(userId, { connectionIds, found: false });
        socket.to(connectionIds).emit("towRequest", {
            userId,
            firstName,
            lastName,
            licensePlate,
            pickUpLocationLatitude,
            pickUpLocationLongtitude,
        });
    }
    else {
        socket.emit("noTow", "sorry no tow trucks within 50km radius");
    }
});
exports.towRequest = towRequest;
const updateTowLocation = (socket, body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clientId, userId, latitude, longtitude } = body;
        const driver = yield db.driver.update({
            where: { id: userId },
            data: {
                latitude,
                longtitude,
            },
        });
        const client = connections.get(clientId);
        socket.to(client).emit("driverLocationUpdate", { driver });
    }
    catch (error) {
        console.log(error);
        socket.emit("towError", { message: "error occured", error });
    }
});
exports.updateTowLocation = updateTowLocation;
const acceptTowRequest = (socket, body) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, latitude, longtitude, clientId } = body;
    const object = clientDrivers.get(clientId);
    if (object) {
        const { connectionIds, found } = object;
        if (found) {
            const ids = connectionIds.filter((id) => id != userId);
            if (ids.length > 0) {
                socket.to(ids).emit("towCancel", "ride was taken");
                clientDrivers.delete(clientId);
            }
        }
        else {
            clientDrivers.set(clientId, { connectionIds, found: true });
            const client = connections.get(clientId);
            socket.emit("towAccept", "GO GETTEM TIGER");
            socket.to(client).emit("towAccept", { latitude, longtitude });
            return;
        }
    }
});
exports.acceptTowRequest = acceptTowRequest;
const cancelTow = (socket, body) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = body;
    const object = clientDrivers.get(userId);
    if (object) {
        socket.to(object.connectionIds).emit("towCancel", "ride was taken");
        clientDrivers.delete(userId);
    }
    socket.emit("towCancel", "Tow cancelled");
});
exports.cancelTow = cancelTow;
//# sourceMappingURL=towController.js.map