import { Router } from "express";
import { checkTrip } from "../Controllers/clientController";

const router = Router();

router.post("/checkTrip", checkTrip);

module.exports = router;
