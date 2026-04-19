const express = require("express");
const router = express.Router();
const { getOSINT } = require("../controllers/osint.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/osint", auth, getOSINT);

module.exports = router;
