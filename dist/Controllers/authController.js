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
exports.checkNumber = exports.checkOtpController = exports.otpController = exports.signinDriver = exports.singUpController = exports.signinPhoneController = void 0;
const client_1 = require("@prisma/client");
let db = new client_1.PrismaClient();
const accountSid = "AC9d6d2cfd6a08b78b1f0dd10bf680d5d5";
const authToken = "13266653bbf5ccc79ef8c8a15f0243fa";
const verifySid = "VA97d73748fb156a1cfbdf334c716d768f";
const client = require("twilio")(accountSid, authToken);
const signinPhoneController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { phoneNumber } = req.body;
        let user = yield db.client.findUniqueOrThrow({
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
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: err["name"] });
    }
});
exports.signinPhoneController = signinPhoneController;
const singUpController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { firstName, lastName, phoneNumber } = req.body;
        let user = yield db.client.create({
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
    }
    catch (err) {
        console.log(err);
        res.status(400).json({ message: err });
    }
});
exports.singUpController = singUpController;
const signinDriver = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { phoneNumber } = req.body;
        let user = yield db.driver.findUniqueOrThrow({
            where: { phoneNumber },
        });
        user
            ? res.status(200).json({ user, message: "Logged In" })
            : res
                .status(400)
                .json({ message: "There is no such user in our records" });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: err["name"] });
    }
});
exports.signinDriver = signinDriver;
const otpController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { phoneNumber } = req.body;
        let result = yield client.verify.v2
            .services(verifySid)
            .verifications.create({ to: `${phoneNumber}`, channel: "sms" });
        res.status(200).json({ sid: result["sid"] });
    }
    catch (err) {
        console.log(err);
        res.status(400);
    }
});
exports.otpController = otpController;
const checkOtpController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { sid, code } = req.body;
        let result = yield client.verify.v2
            .services(verifySid)
            .verificationChecks.create({
            verificationSid: sid,
            code: code,
        });
        res.status(200).send({ status: result["status"] });
    }
    catch (err) {
        console.log(err);
        res.status(400);
    }
});
exports.checkOtpController = checkOtpController;
const checkNumber = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { phoneNumber } = req.body;
        let result = yield db.client.findUniqueOrThrow({
            where: { phoneNumber },
        });
        return result
            ? res.status(200).json({ valid: false })
            : res.status(200).json({ valid: true });
    }
    catch (err) {
        console.log(err);
        return res.status(400).json({ message: err["name"] });
    }
});
exports.checkNumber = checkNumber;
//# sourceMappingURL=authController.js.map