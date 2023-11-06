import { Router } from "express";
import {
  checkNumber,
  checkOtpController,
  otpController,
  signinDriver,
  signinPhoneController,
  singUpController,
} from "../Controllers/authController";

const router = Router();

router.post("/login", signinPhoneController);

router.post("/loginDriver", signinDriver);

router.post("/signUp", singUpController);

router.post("/otp", otpController);

router.post("/checkOtp", checkOtpController);

router.post("/checkNumber", checkNumber);

module.exports = router;