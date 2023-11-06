import { Router } from "express";
import { getShops } from "../Controllers/storeController";

const router = Router();

router.post("/getShops", getShops);

module.exports = router;
