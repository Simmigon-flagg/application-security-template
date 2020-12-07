require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser())
//Set up remote database
require("./config/mongooseconnection");
const auth = require("./routes/auth");
const user = require("./routes/user");
const morgan = require("morgan");
const PORT = process.env.PORT || 4000;

// // Remove this later
// app.get("/api/v1/user/all", async (request, response) => {
//   const users = await Users.find({});
//   return response.json(users);
// });

app.use(morgan());
app.use("/api/v1/auth", auth);
app.use("/api/v1/user", user);


app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
