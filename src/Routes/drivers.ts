import { Router } from "express";
import {
  changeState,
  checkTrip,
  getIncome,
  getState,
  getTrips,
  tripCheck,
} from "../Controllers/driversController";

const router = Router();

router.post("/trips", getTrips);

router.post("/state", getState);

router.post("/tripCheck", tripCheck);

router.post("/getIncome", getIncome);

router.post("/checkTrip", checkTrip);

router.put("/changeState", changeState);

module.exports = router;
