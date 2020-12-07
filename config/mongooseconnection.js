const mongoose = require("mongoose");
const Users = require("../models/Users");

const uri = process.env.MONGODB_URI || process.env.DB_CONNECTION;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Connected To MONGO");
  })
  .catch((error) => {
    console.log(error.message);
  });

// mongoose.connection.on("connected", async () => {
//     console.log("DB Connected!")
// });

mongoose.connection.on("error", (error) => {
  console.log("error: " + error.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose default connection is disconnected");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
