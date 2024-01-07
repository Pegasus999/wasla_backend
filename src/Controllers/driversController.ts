import { Driver, PrismaClient, Trip } from "@prisma/client";

import { Request, Response } from "express";
import { Socket } from "socket.io";

let db = new PrismaClient();

export const tripCheck = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const trip = await db.trip.findFirstOrThrow({
      where: { driverId: userId, state: "ongoing" },
      include: { driver: true, client: true },
    });

    res.status(200).json({ trip: trip });
  } catch (error) {
    console.log(error);
  }
};

export const checkTrip = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.body;
    const trip = await db.trip.findFirstOrThrow({ where: { id: tripId } });
    if (trip.state == "canceled" && trip.canceledBy != null) {
      res
        .status(400)
        .json({ exist: false, message: "The ride canceled by the client" });
    } else if (trip.state == "canceled" && trip.canceledBy == null) {
      res
        .status(400)
        .json({ exist: false, message: "The ride is no longer valid" });
    } else if (trip.driverId) {
      res
        .status(400)
        .json({ exist: false, message: "The ride is already taken" });
    } else {
      console.log("checking");
      console.log(trip);
      res.status(200).json({ exist: true, message: "The ride is exists" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An Error Occured" });
  }
};

export const getTrips = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const trips: Trip[] | null = await db.trip.findMany({
      where: { driverId: id, state: "complete" },
      include: {
        client: true,
        driver: true,
      },
    });
    res.status(200).json(trips);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An Error Occured" });
  }
};
function endOfMonth(date: any) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
function startOfMonth(date: any) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export const getIncome = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    const currentDate = new Date();
    const startOfMonthDate = startOfMonth(currentDate);
    const endOfMonthDate = endOfMonth(currentDate);

    const trips = await db.trip.findMany({
      where: {
        driverId: id,
        date: {
          gte: startOfMonthDate,
          lte: endOfMonthDate,
        },
        state: "complete",
      },
    });

    const totalCost: number = trips.reduce((sum, trip) => sum + trip.cost, 0);
    const today = trips
      .filter((trip) => {
        return (
          trip.date.getDate() === currentDate.getDate() &&
          trip.date.getMonth() === currentDate.getMonth() &&
          trip.date.getFullYear() === currentDate.getFullYear()
        );
      })
      .reduce((sum, trip) => sum + trip.cost, 0);

    res.status(200).json({ today: today, month: totalCost });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An Error Occured" });
  }
  res.status(200);
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
    const driver: Driver | null = await db.driver.findUniqueOrThrow({
      where: { id },
    });
    if (driver) {
      const updateDriver: Driver | null = await db.driver.update({
        where: {
          id,
        },
        data: {
          active: false,
        },
      });
    }
    return;
  } catch (error) {
    console.log(error);
    return;
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
