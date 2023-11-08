import { Driver, PrismaClient, Trip } from "@prisma/client";

import { Request, Response } from "express";
import { Socket } from "socket.io";

let db = new PrismaClient();

export const getTrips = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const trips: Trip[] | null = await db.trip.findMany({
      where: { driverId: id },
      include: {
        client: true,
        driver: true,
      },
    });
    console.log(trips);
    res.status(200).json(trips);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An Error Occured" });
  }
};

export const getState = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const driver: Driver | null = await db.driver.findUniqueOrThrow({
      where: { id },
    });
    res.status(200).json({ active: driver.active });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An Error Occured" });
  }
};

export const disconnect = async (id: string) => {
  try {
    const driver: Driver | null = await db.driver.update({
      where: {
        id,
      },
      data: {
        active: false,
      },
    });
  } catch (error) {
    console.log(error);
  }
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

    console.log(driver);
    socket.emit("updateLocation", driver);
  } catch (error) {
    console.log(error);
    socket.emit("error");
  }
};

export const changeState = async (req: Request, res: Response) => {
  try {
    const { id, active } = req.body;

    const driver: Driver | null = await db.driver.update({
      where: { id: id },
      data: {
        active,
      },
    });
    res.status(200).json(driver);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An Error Occured" });
  }
};
