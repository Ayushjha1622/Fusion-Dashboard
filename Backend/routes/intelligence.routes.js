const express = require("express");
const router = express.Router();
const intelligenceController = require("../controllers/intelligence.controller");
const upload = require("../middlewares/upload.middleware");

// Get Intelligence Data
router.get("/data", intelligenceController.getData);

// Upload HUMINT CSV
router.post("/humint", upload.any(), intelligenceController.uploadHumint);

// Upload IMINT Image + S3
router.post("/imint", upload.single("image"), intelligenceController.uploadImint);

module.exports = router;
