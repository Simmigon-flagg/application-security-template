const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
//Database is missing

// Landing Page
router.get("/", (request, response) => {
  // Cookies that have not been signed
  console.log(request.cookies.access_token);

  return response.json({ message: "Api Auth Server" });
});
// Home
router.get("/home", checkAuthToken, (request, response) => {
  console.log(request.user)
  // const checkcreds  = request.user.isAdmin;
  // if(checkcreds){
  //   const cars = await Fleet.find({})

  //   return response.json(cars);
  // }else{

  //   return response.status(403);
  // }
  return response.json({
    message:
      "Let me use this app. Oh and get my Stuff Get My Stuff from the database",
  });
});

function checkAuthToken(request, response, next) {
  const token = request.cookies.access_token;

  if (token == null) return response.status(401).send();

  jwt.verify(token, process.env.TOKEN_SECRET, (error, user) => {
    if (error) return response.status(403).send();
    request.user = user;
    next();
  });
}
module.exports = router;
