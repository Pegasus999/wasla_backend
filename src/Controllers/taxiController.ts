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
    where: {
      type: "taxi",
      active: true,
      wilaya,
      trips: { every: { state: { not: "ongoing" } } },
    },
  });

  let nearbyDrivers: Driver[] = drivers.filter((driver) => {
    return (
      calculateDistance(
        latitude,
        longtitude,
        driver.latitude!,
        driver.longtitude!
      ) < 5
    );
  });

  if (nearbyDrivers.length == 0) {
    nearbyDrivers = drivers.filter((driver) => {
      return (
        calculateDistance(
          latitude,
          longtitude,
          driver.latitude!,
          driver.longtitude!
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
    let trip: Trip | null = null;
    if (drivers.length > 0) {
      trip = await db.trip.create({
        data: {
          destinationLatitude,
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
      returnTripToClient(trip, socket);
    }
    let ids = drivers.map((driver) => driver.id);
    let connectionIds = ids
      .map((id) => connections.get(id))
      .filter((value) => value != null);
    console.log(connectionIds);
    if (connectionIds.length > 0) {
      // Set a timeout for driver response (e.g., 2 minutes)
      setTimeout(async () => {
        let check = await db.trip.findUnique({ where: { id: trip!.id } });
        if (check?.state == "ongoing" && check.driverId == null) {
          check = await db.trip.update({
            where: { id: check.id },
            data: { state: "canceled" },
          });
          console.log(check?.state);
          console.log("trip canceled");
        }
      }, 120000);
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

const returnTripToClient = (trip: Trip, socket: Socket) => {
  const client = connections.get(trip.clientId);
  console.log("in returning the trip to the client before the acceptance");
  // in returning the trip to the client before the acceptance"
  console.log(client);
  console.log(trip);
  socket.emit("tripCreated", { trip });
};

export const updateLocation = async (socket: Socket, body: any) => {
  try {
    const { userId, latitude, longtitude } = body;
    const driver: Driver | null = await db.driver.update({
      where: { id: userId },
      data: {
        latitude,
        longtitude,
      },
    });

    const user = await db.trip.findFirst({
      select: { client: true },
      where: { driverId: userId, state: "ongoing" },
    });
    if (user) {
      const client = connections.get(user?.client.id);
      socket.to(client).emit("driverLocationUpdate", { driver });
    }
  } catch (error) {
    console.log(error);
    socket.emit("rideError", { message: "error occured", error });
  }
};

export const acceptRequest = async (socket: Socket, body: any) => {
  const { userId, tripId, timeoutId } = body;
  try {
    const check: Trip | null = await db.trip.findUnique({
      where: { id: tripId },
      include: { driver: true, client: true },
    });
    console.log(
      check?.pickUpLocationLatitude + " " + check?.pickUpLocationLongtitude
    );
    console.log(
      check?.destinationLatitude + " " + check?.destinationLongtitude
    );
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

      clearTimeout(timeoutId);
      socket.emit("rideAccept", { trip });
      socket.to(client).emit("rideAccept", { trip });
    }
  } catch (error) {
    console.log(error);
    socket.emit("rideError", { message: "An error occured", error });
  }
};

export const endRide = async (socket: Socket, body: any) => {
  try {
    console.log("ending");
    console.log(body);
    const { tripId, duration } = body;
    const trip: Trip | null = await db.trip.update({
      where: { id: tripId },
      data: {
        duration,
        state: "complete",
      },
    });

    console.log(trip);
    const client = connections.get(trip.clientId);
    socket.to(client).emit("rideEnd", { trip });
    socket.emit("rideEnd", { trip });
  } catch (error) {
    console.log(error);
    socket.emit("error", { message: "An error occured", error });
  }
};

export const cancelRide = async (socket: Socket, body: any) => {
  try {
    const { tripId, userId } = body;
    const check = await db.trip.findUniqueOrThrow({ where: { id: tripId } });
    if (check.state != "complete") {
      const trip = await db.trip.update({
        where: { id: tripId },
        data: { state: "canceled", canceledBy: userId },
      });
      console.log("cancelling");
      console.log(trip);
      if (trip.driverId) {
        const driver = connections.get(trip.driverId);
        const client = connections.get(trip.clientId);

        socket
          .to(driver)
          .emit("rideCancel", { message: "ride was canceled", byWho: userId });

        socket
          .to(client)
          .emit("rideCancel", { message: "ride was canceled", byWho: userId });
      } else {
        let drivers = clientDrivers.get(userId);

        socket.to(drivers).emit("rideCancel", { trip });
      }
    }
  } catch (error) {
    socket.emit("error", { message: "An error occured", error });
  }
};
