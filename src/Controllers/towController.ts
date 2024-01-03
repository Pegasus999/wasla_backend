import { Driver, PrismaClient } from "@prisma/client";
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
  longtitude: number
): Promise<Driver[]> => {
  const drivers: Driver[] | null = await db.driver.findMany({
    where: { type: "tow", active: true },
  });

  let nearbyDrivers: Driver[] = [];
  let km: number = 5;
  while (nearbyDrivers.length == 0 && km < 50) {
    nearbyDrivers = drivers.filter((driver) => {
      return (
        calculateDistance(
          latitude,
          longtitude,
          driver.latitude!,
          driver.longtitude!
        ) < km
      );
    });

    km += 5;
  }

  return nearbyDrivers;
};

let clientDrivers = new Map();

export const towRequest = async (socket: Socket, body: any) => {
  const {
    firstName,
    lastName,
    licensePlate,
    userId,
    pickUpLocationLatitude,
    pickUpLocationLongtitude,
  } = body;
  const drivers = await lookForDriver(
    pickUpLocationLatitude,
    pickUpLocationLongtitude
  );

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
  } else {
    socket.emit("noTow", "sorry no tow trucks within 50km radius");
  }
};

export const updateTowLocation = async (socket: Socket, body: any) => {
  try {
    const { clientId, userId, latitude, longtitude } = body;
    const driver: Driver | null = await db.driver.update({
      where: { id: userId },
      data: {
        latitude,
        longtitude,
      },
    });
    const client = connections.get(clientId);

    socket.to(client).emit("driverLocationUpdate", { driver });
  } catch (error) {
    console.log(error);
    socket.emit("towError", { message: "error occured", error });
  }
};

export const acceptTowRequest = async (socket: Socket, body: any) => {
  const { userId, latitude, longtitude, clientId } = body;
  const object = clientDrivers.get(clientId);
  if (object) {
    const { connectionIds, found } = object;
    if (found) {
      const ids = connectionIds.filter((id: any) => id != userId);
      if (ids.length > 0) {
        socket.to(ids).emit("towCancel", "ride was taken");
        clientDrivers.delete(clientId);
      }
    } else {
      clientDrivers.set(clientId, { connectionIds, found: true });
      const client = connections.get(clientId);
      socket.emit("towAccept", "GO GETTEM TIGER");
      socket.to(client).emit("towAccept", { latitude, longtitude });
      return;
    }
  }
};

export const cancelTow = async (socket: Socket, body: any) => {
  const { userId } = body;
  const object = clientDrivers.get(userId);
  if (object) {
    socket.to(object.connectionIds).emit("towCancel", "ride was taken");
    clientDrivers.delete(userId);
  }
  socket.emit("towCancel", "Tow cancelled");
};
