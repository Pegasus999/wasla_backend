import { Driver, PrismaClient, Trip } from "@prisma/client";

import { Request, Response } from "express";
import { Socket } from "socket.io";

let db = new PrismaClient();

export const checkTrip = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const trip = await db.trip.findFirstOrThrow({
      where: { clientId: userId, state: "ongoing" },
      include: { driver: true },
    });

    res.status(200).json({ trip: trip });
  } catch (error) {
    console.log(error);
  }
};
