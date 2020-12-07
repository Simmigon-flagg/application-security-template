const express = require("express");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
const router = express.Router();
// Landing Page
router.get("/", (request, response) => {
  // Cookies that have not been signed
  console.log(request.cookies.access_token);

  return response.json({ message: "Api Auth Server" });
});
// Home
router.get("/home", (request, response) => {
  // Cookies that have not been signed
  console.log(request.cookies.access_token);
  console.log("Get My Stuff from the database");

  return response.json({ message: "Api Auth Server" });
});

function createAccessToken(user) {
  return jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: "1d" });
}
module.exports = router;
