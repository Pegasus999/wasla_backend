"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storeController_1 = require("../Controllers/storeController");
const router = (0, express_1.Router)();
router.post("/getShops", storeController_1.getShops);
module.exports = router;
//# sourceMappingURL=shop.js.map