const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// ? User login
router.post("/login", authController.login);
// ? User logout
router.get("/logout", authController.logout);


module.exports = router;
