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
exports.cancelRide = exports.endRide = exports.acceptRequest = exports.updateLocation = exports.rideRequest = void 0;
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
const lookForDriver = (latitude, longtitude, wilaya) => __awaiter(void 0, void 0, void 0, function* () {
    const drivers = yield db.driver.findMany({
        where: { type: "taxi", active: true, wilaya },
    });
    let nearbyDrivers = drivers.filter((driver) => {
        return (calculateDistance(latitude, longtitude, driver.latitude, driver.longtitude) < 5);
    });
    if (nearbyDrivers.length == 0) {
        nearbyDrivers = drivers.filter((driver) => {
            return (calculateDistance(latitude, longtitude, driver.latitude, driver.longtitude) < 8);
        });
    }
    return nearbyDrivers;
});
let clientDrivers = new Map();
const rideRequest = (socket, body) => __awaiter(void 0, void 0, void 0, function* () {
    const { wilaya, userId, cost, destinationLatitude, destinationLongtitude, pickUpLocationLatitude, pickUpLocationLongtitude, } = body;
    const drivers = yield lookForDriver(pickUpLocationLatitude, pickUpLocationLongtitude, wilaya);
    let date = new Date();
    let trip = null;
    if (drivers.length > 0) {
        try {
            trip = yield db.trip.create({
                data: {
                    destinationLatitude,
                    date: date.toLocaleString(),
                    destinationLongtitude,
                    pickUpLocationLongtitude,
                    pickUpLocationLatitude,
                    cost,
                    client: {
                        connect: {
                            id: userId,
                        },
                    },
                },
                include: {
                    client: true,
                },
            });
        }
        catch (error) {
            socket.emit("rideError", { message: "An error occured", error });
            return;
        }
    }
    let ids = drivers.map((driver) => driver.id);
    let connectionIds = ids
        .map((id) => connections.get(id))
        .filter((value) => value != null);
    if (connectionIds.length > 0) {
        clientDrivers.set(userId, connectionIds);
        socket.to(connectionIds).emit("rideRequest", { trip });
    }
    else {
        socket.emit("noRides", "sorry no rides within 8 km radius");
    }
});
exports.rideRequest = rideRequest;
const updateLocation = (socket, body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clientId, userId, latitude, longtitude } = body;
        const driver = yield db.driver.update({
            where: { id: userId },
            data: {
                latitude,
                longtitude,
            },
        });
        if (clientId) {
            const client = connections.get(clientId);
            socket.to(client).emit("driverLocationUpdate", { driver });
        }
    }
    catch (error) {
        console.log(error);
        socket.emit("rideError", { message: "error occured", error });
    }
});
exports.updateLocation = updateLocation;
const acceptRequest = (socket, body) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, tripId } = body;
    try {
        const check = yield db.trip.findUnique({
            where: { id: tripId },
            include: { driver: true, client: true },
        });
        let trip = null;
        if (!(check === null || check === void 0 ? void 0 : check.driverId)) {
            trip = yield db.trip.update({
                data: {
                    driver: {
                        connect: {
                            id: userId,
                        },
                    },
                },
                where: {
                    id: tripId,
                },
                include: {
                    driver: true,
                    client: true,
                },
            });
            const list = clientDrivers.get(trip.clientId);
            const ids = list.filter((id) => id != userId);
            if (ids.length > 0) {
                socket.to(ids).emit("rideCancel", "ride was taken");
                clientDrivers.delete(trip.clientId);
            }
            const client = connections.get(trip.clientId);
            console.log(client);
            socket.emit("rideAccept", { trip });
            socket.to(client).emit("rideAccept", { trip });
        }
        else {
            socket.emit("rideError", { message: "Already taken" });
        }
    }
    catch (error) {
        console.log(error);
        socket.emit("rideError", { message: "An error occured", error });
    }
});
exports.acceptRequest = acceptRequest;
const endRide = (socket, body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tripId, duration } = body;
        const trip = yield db.trip.update({
            where: { id: tripId },
            data: {
                duration,
            },
        });
        const client = connections.get(trip.clientId);
        socket.emit("endRide", { trip });
        socket.to(client).emit("endRide", { trip });
    }
    catch (error) {
        socket.emit("rideError", { message: "An error occured", error });
    }
});
exports.endRide = endRide;
const cancelRide = (socket, body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tripdId } = body;
        const trip = yield db.trip.delete({ where: { id: tripdId } });
        socket.emit("rideCancel", { trip });
        if (trip.driverId) {
            const driver = connections.get(trip.driverId);
            const client = connections.get(trip.clientId);
            socket.to(driver).emit("rideCancel", { message: "ride was canceled" });
            socket.to(client).emit("rideCancel", { message: "ride was canceled" });
        }
        else {
            const list = clientDrivers.get(trip.clientId);
            if (list.length > 0) {
                socket.to(list).emit("rideCancel", "ride was cancelled");
                clientDrivers.delete(trip.clientId);
            }
        }
    }
    catch (error) {
        socket.emit("rideError", { message: "An error occured", error });
    }
});
exports.cancelRide = cancelRide;
//# sourceMappingURL=taxiController.js.map