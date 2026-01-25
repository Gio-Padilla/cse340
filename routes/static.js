const express = require('express');
const router = express.Router();
const errorController = require("../controllers/errorController");

// Static Routes
// Set up "public" folder / subfolders for static files
router.use(express.static("public"));
router.use("/css", express.static(__dirname + "public/css"));
router.use("/js", express.static(__dirname + "public/js"));
router.use("/images", express.static(__dirname + "public/images"));

// Route to trigger 500
router.get("/trigger500", errorController.throw500);

module.exports = router;



