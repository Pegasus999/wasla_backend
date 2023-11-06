import { Router } from "express";
import {
  changeState,
  getState,
  getTrips,
} from "../Controllers/driversController";

const router = Router();

router.post("/trips", getTrips);

router.post("/state", getState);

router.put("/changeState", changeState);

module.exports = router;
