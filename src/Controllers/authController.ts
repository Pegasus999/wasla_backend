import { PrismaClient, Client, Driver } from "@prisma/client";

import { Request, Response } from "express";
import { Twilio } from "twilio";

let db = new PrismaClient();
const accountSid = "AC9d6d2cfd6a08b78b1f0dd10bf680d5d5";
const authToken = "13266653bbf5ccc79ef8c8a15f0243fa";
const verifySid = "VA97d73748fb156a1cfbdf334c716d768f";
const client = require("twilio")(accountSid, authToken);

export const signinPhoneController = async (req: Request, res: Response) => {
  try {
    let { phoneNumber } = req.body;
    console.log("here");
    let user: Client | null = await db.client.findUniqueOrThrow({
      where: { phoneNumber },
      include: {
        favorites: true,
        trips: true,
      },
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

export const singUpController = async (req: Request, res: Response) => {
  try {
    let { firstName, lastName, phoneNumber } = req.body;

    let user: Client | null = await db.client.create({
      data: {
        firstName,
        lastName,
        phoneNumber,
      },
      include: {
        favorites: true,
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
    let { firstName, lastName, phoneNumber } = req.body;

    let user: Driver | null = await db.driver.create({
      data: {
        firstName,
        lastName,
        phoneNumber,
        active: false,
        carBrand: "Renault",
        carName: "Symbol",
        licensePlate: "265649 - 116 - 25",
        latitude: 0.0,
        longtitude: 0.0,
        driverLicense: "2648421384932",
        registeration: "61654984513",
        type: "taxi",
        wilaya: 25,
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

export const otpController = async (req: Request, res: Response) => {
  try {
    let { phoneNumber } = req.body;

    let result = await client.verify.v2
      .services(verifySid)
      .verifications.create({ to: `${phoneNumber}`, channel: "sms" });

    res.status(200).json({ sid: result["sid"] });
  } catch (err) {
    console.log(err);
    res.status(400);
  }
};

export const checkOtpController = async (req: Request, res: Response) => {
  try {
    let { sid, code } = req.body;
    let result = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({
        verificationSid: sid,
        code: code,
      });

    res.status(200).send({ status: result["status"] });
  } catch (err) {
    console.log(err);
    res.status(400);
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
