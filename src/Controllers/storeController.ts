import { PrismaClient, Shop } from "@prisma/client";

import { Request, Response } from "express";

let db = new PrismaClient();

export const getShops = async (req: Request, res: Response) => {
  try {
    let { wilaya, type } = req.body;
    console.log("here");
    let shops: Shop[] | null = await db.shop.findMany({
      where: { wilaya, type },
    });
    res.status(200).json(shops);
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ message: err["name"] });
  }
};
