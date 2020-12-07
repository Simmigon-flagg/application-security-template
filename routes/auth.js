const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const Users = require("../models/Users");

router.post("/signup", async (request, response) => {
  const searchByUserName = { email: request.body.email };
  // Some Validation of data need to hrouteren here.
  const foundUser = await Users.find(searchByUserName);
  if (foundUser.length < 1) {
    try {
      const hashedPassword = await bcrypt.hash(request.body.password, 10);
      const user = {
        email: request.body.email,
        password: hashedPassword,
        isAdmin: request.body.isAdmin,
      };
      const newUser = new Users(user);
      await newUser.save((error, user) => {
        if (!error) {
          // User Created
          const userTokenData = {
            _id: user._id,
            email: user.email,
            isAdmin: user.isAdmin,
          };

          const token = createAccessToken(userTokenData);
          //Set Cookie. Uncommit secure in prod
          response.cookie("access_token", token, {
            expires: new Date(Date.now() + 30),
            httpOnly: true,
            // secure: true
          });
          return response.status(201).json({ email: userTokenData.email });
        } else {
          // This is a database error or schema error
          return response.sendStatus(500);
        }
      });
    } catch {
      // The Try Failed
      return response.sendStatus(500);
    }
  } else {
    return response.status(404).json({ message: "That user already exist" });
  }
});

router.post("/login", async (request, response) => {
  //Get the Cookie First
  //Search for user by email
  //Then Compare passwords
  //If the pasword word match
  //Send New Token
  const search = { email: request.body.email };
  const foundUser = await Users.find(search);
  if (foundUser.length > 0) {
    const { id, name, isAdmin } = foundUser[0];
    try {
      if (await bcrypt.compare(request.body.password, foundUser[0].password)) {
        user = {
          id: foundUser[0]._id,
          email: foundUser[0].email,
          isAdmin: foundUser[0].isAdmin,
        };

        const token = createAccessToken(user);
        //Set Cookie. Uncommit secure in prod
        response.cookie("access_token", token, {
          expires: new Date(Date.now() + 30),
          httpOnly: true,
          // secure: true
        });
        return response.status(200).json({ email: user.email });
      } else {
        return response
          .status(401)
          .json({ message: "Invalid Username/Password" });
      }
    } catch {
      // Server Error. Maybe sent a better message than Internal Server Error
      return response.status(500);
    }
  } else {
    return response.status(401).json({ message: "Invalid Username/Password" });
  }
});

router.delete("/logout", (request, response) => {
  return response.sendStatus(202);
});



function createAccessToken(user) {
  return jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: "1d" });
}
module.exports = router;
