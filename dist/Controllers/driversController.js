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
exports.changeState = exports.getState = exports.getTrips = void 0;
const client_1 = require("@prisma/client");
let db = new client_1.PrismaClient();
const getTrips = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const trips = yield db.trip.findMany({
            where: { driverId: id },
            include: {
                client: true,
                driver: true,
            },
        });
        console.log(trips);
        res.status(200).json(trips);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "An Error Occured" });
    }
});
exports.getTrips = getTrips;
const getState = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const driver = yield db.driver.findUniqueOrThrow({
            where: { id },
        });
        res.status(200).json({ active: driver.active });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "An Error Occured" });
    }
});
exports.getState = getState;
const changeState = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, active } = req.body;
        const driver = yield db.driver.update({
            where: { id: id },
            data: {
                active,
            },
        });
        res.status(200).json(driver);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "An Error Occured" });
    }
});
exports.changeState = changeState;
//# sourceMappingURL=driversController.js.map