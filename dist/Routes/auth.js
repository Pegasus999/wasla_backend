"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../Controllers/authController");
const router = (0, express_1.Router)();
router.post("/login", authController_1.signinPhoneController);
router.post("/loginDriver", authController_1.signinDriver);
router.post("/signUp", authController_1.singUpController);
router.post("/otp", authController_1.otpController);
router.post("/checkOtp", authController_1.checkOtpController);
router.post("/checkNumber", authController_1.checkNumber);
module.exports = router;
//# sourceMappingURL=auth.js.map