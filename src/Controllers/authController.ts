import { PrismaClient, Client, Driver } from "@prisma/client";
import { Request, Response } from "express";
let db = new PrismaClient();

export const signinPhoneController = async (req: Request, res: Response) => {
  try {
    let { phoneNumber } = req.body;
    console.log("here");
    let user: Client | null = await db.client.findUniqueOrThrow({
      where: { phoneNumber },
      include: {
        trips: true,
      },
    });
    res.status(200).json({ user, message: "Logged In" });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ message: err["name"] });
  }
};

export const singUpController = async (req: Request, res: Response) => {
  try {
    let { firstName, lastName, phoneNumber } = req.body;

    let user: Client | null = await db.client.create({
      data: {
        firstName,
        lastName,
        phoneNumber,
      },
    });
    user
      ? res.status(200).json({ user, message: "User created" })
      : res.status(400).json({ message: "An error occured" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const signUpDriver = async (req: Request, res: Response) => {
  try {
    let {
      firstName,
      lastName,
      phoneNumber,
      carBrand,
      carName,
      licensePlate,
      driverLicense,
      registeration,
      wilaya,
    } = req.body;

    let user: Driver | null = await db.driver.create({
      data: {
        firstName,
        lastName,
        phoneNumber,
        active: false,
        carBrand,
        carName,
        licensePlate,
        latitude: 0.0,
        longtitude: 0.0,
        driverLicense,
        registeration,
        type: "taxi",
        wilaya: wilaya,
      },
    });
    user
      ? res.status(200).json({ user, message: "User created" })
      : res.status(400).json({ message: "An error occured" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const signinDriver = async (req: Request, res: Response) => {
  try {
    let { phoneNumber } = req.body;
    let user: Driver | null = await db.driver.findUniqueOrThrow({
      where: { phoneNumber },
    });
    user
      ? res.status(200).json({ user, message: "Logged In" })
      : res
          .status(400)
          .json({ message: "There is no such user in our records" });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ message: err["name"] });
  }
};
export const checkNumber = async (req: Request, res: Response) => {
  try {
    let { phoneNumber } = req.body;
    let result: Client | null = await db.client.findUniqueOrThrow({
      where: { phoneNumber },
    });
    return result
      ? res.status(200).json({ valid: false })
      : res.status(200).json({ valid: true });
  } catch (err: any) {
    console.log(err);
    return res.status(400).json({ message: err["name"] });
  }
};
