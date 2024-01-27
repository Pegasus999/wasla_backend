import { Router } from "express";
import {
  checkNumber,
  signUpDriver,
  signinDriver,
  signinPhoneController,
  singUpController,
} from "../Controllers/authController";

const router = Router();

router.post("/login", signinPhoneController);

router.post("/loginDriver", signinDriver);

router.post("/signUp", singUpController);

router.post("/signUpDriver", signUpDriver);

router.post("/checkNumber", checkNumber);

module.exports = router;
