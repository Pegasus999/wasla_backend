"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const driversController_1 = require("../Controllers/driversController");
const router = (0, express_1.Router)();
router.post("/trips", driversController_1.getTrips);
router.post("/state", driversController_1.getState);
router.put("/changeState", driversController_1.changeState);
module.exports = router;
//# sourceMappingURL=drivers.js.map