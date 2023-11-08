import { PrismaClient, Driver, Trip } from "@prisma/client";
import { connect } from "http2";
import { Socket } from "socket.io";

let db = new PrismaClient();

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const earthRadius = 6371; // Radius of the Earth in kilometers

  const radiansLat1 = (Math.PI / 180) * lat1;
  const radiansLat2 = (Math.PI / 180) * lat2;
  const radiansLon1 = (Math.PI / 180) * lon1;
  const radiansLon2 = (Math.PI / 180) * lon2;

  const distance =
    Math.acos(
      Math.sin(radiansLat1) * Math.sin(radiansLat2) +
        Math.cos(radiansLat1) *
          Math.cos(radiansLat2) *
          Math.cos(radiansLon2 - radiansLon1)
    ) * earthRadius;

  return distance;
}
const lookForDriver = async (
  latitude: number,
  longtitude: number,
  wilaya: number
): Promise<Driver[]> => {
  const drivers: Driver[] | null = await db.driver.findMany({
    where: { type: "taxi", active: true, wilaya },
  });

  let nearbyDrivers: Driver[] = drivers.filter((driver) => {
    return (
      calculateDistance(
        latitude,
        longtitude,
        driver.latitude,
        driver.longtitude
      ) < 5
    );
  });

  if (nearbyDrivers.length == 0) {
    nearbyDrivers = drivers.filter((driver) => {
      return (
        calculateDistance(
          latitude,
          longtitude,
          driver.latitude,
          driver.longtitude
        ) < 8
      );
    });
  }
  return nearbyDrivers;
};

let clientDrivers = new Map();

export const rideRequest = async (socket: Socket, body: any) => {
  try {
    const {
      wilaya,
      userId,
      cost,
      destinationLatitude,
      destinationLongtitude,
      pickUpLocationLatitude,
      pickUpLocationLongtitude,
    } = body;
    const drivers = await lookForDriver(
      pickUpLocationLatitude,
      pickUpLocationLongtitude,
      wilaya
    );
    let date = new Date();
    let trip: Trip | null = null;
    if (drivers.length > 0) {
      trip = await db.trip.create({
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
    let ids = drivers.map((driver) => driver.id);
    let connectionIds = ids
      .map((id) => connections.get(id))
      .filter((value) => value != null);
    console.log(connectionIds);
    if (connectionIds.length > 0) {
      clientDrivers.set(userId, connectionIds);
      socket.to(connectionIds).emit("rideRequest", { trip });
    } else {
      socket.emit("noRides", "sorry no rides within 8 km radius");
    }
  } catch (error) {
    console.log(error);
    socket.emit("error");
  }
};

export const updateLocation = async (socket: Socket, body: any) => {
  try {
    const { clientId, userId, latitude, longtitude } = body;
    const driver: Driver | null = await db.driver.update({
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
  } catch (error) {
    console.log(error);
    socket.emit("rideError", { message: "error occured", error });
  }
};

export const acceptRequest = async (socket: Socket, body: any) => {
  const { userId, tripId } = body;
  try {
    const check: Trip | null = await db.trip.findUnique({
      where: { id: tripId },
      include: { driver: true, client: true },
    });
    let trip: Trip | null = null;
    if (!check?.driverId) {
      trip = await db.trip.update({
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
      const list: string[] = clientDrivers.get(trip.clientId);
      const ids = list.filter((id) => id != userId);
      if (ids.length > 0) {
        socket.to(ids).emit("rideCancel", "ride was taken");
        clientDrivers.delete(trip.clientId);
      }
      const client = connections.get(trip.clientId);
      console.log(client);
      socket.emit("rideAccept", { trip });
      socket.to(client).emit("rideAccept", { trip });
    } else {
      socket.emit("rideError", { message: "Already taken" });
    }
  } catch (error) {
    console.log(error);
    socket.emit("rideError", { message: "An error occured", error });
  }
};

export const endRide = async (socket: Socket, body: any) => {
  try {
    const { tripId, duration } = body;
    const trip: Trip | null = await db.trip.update({
      where: { id: tripId },
      data: {
        duration,
      },
    });
    const client = connections.get(trip.clientId);
    socket.emit("endRide", { trip });
    socket.to(client).emit("endRide", { trip });
  } catch (error) {
    socket.emit("rideError", { message: "An error occured", error });
  }
};

export const cancelRide = async (socket: Socket, body: any) => {
  try {
    const { tripId } = body;
    const trip = await db.trip.delete({ where: { id: tripId } });
    socket.emit("rideCancel", { trip });
    if (trip.driverId) {
      const driver = connections.get(trip.driverId);
      const client = connections.get(trip.clientId);
      console.log(driver);
      console.log(client);
      socket.to(driver).emit("rideCancel", { message: "ride was canceled" });
      socket.to(client).emit("rideCancel", { message: "ride was canceled" });
    } else {
      const list: string[] = clientDrivers.get(trip.clientId);
      if (list.length > 0) {
        socket.to(list).emit("rideCancel", "ride was cancelled");
        clientDrivers.delete(trip.clientId);
      }
    }
  } catch (error) {
    socket.emit("rideError", { message: "An error occured", error });
  }
};
