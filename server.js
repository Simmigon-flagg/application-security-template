require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Set up remote database
require("./config/mongooseconnection");
const Users = require("./models/Users");


const app = express();
app.use(express.json());


const PORT = process.env.PORT || 4000;

// Remove this later
app.get("/api/v1", (request, response) => {
    return response.json({ message: "Api Auth Server" });
});
// Remove this later
app.get("/api/v1/user/all", async (request, response) => {
  const users = await Users.find({});
  return response.json(users);
});

app.post("/api/v1/user/signup", async (request, response) => {
  const searchByUserName = { email: request.body.email };
    // Some Validation of data need to happen here.   
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
      await newUser.save((error) => {
        if (!error) {
            // User Created
          return response.sendStatus(201);
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

app.post("/api/v1/user/login", async (request, response) => {
  //Search for user by ID
  //This line is not returning the users name
  const search = { name: request.body.name };
  const foundUser = await Users.find(search);
  let user = {};
  let accessToken ="";
  let refreshToken = "";
  if (foundUser.length > 0) {
    const {id , name, isAdmin} = foundUser[0];
    try {
      if (await bcrypt.compare(request.body.password, foundUser[0].password)) {
          
         user = {
          id: foundUser[0]._id,
          name: foundUser[0].name,
          isAdmin: foundUser[0].isAdmin,
        };
 

        accessToken = createAccessToken(user);
        refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN);
        // Add to redis database
        const id = user.id;
        const token = refreshToken
     
        const temp = {}
        temp[String(id)] = token;
  
        console.log("=====================================")
        
        const found = false;
        for(let i = 0; i < refreshTokens.length; i++){
          const keys =  Object.keys(refreshTokens[i])
          for(let j = 0; j < keys.length; j++){
            console.log(keys[j] + " == "+ id)
            if(keys[j] == id){
              console.log("Found at " + j)
              console.log("Found at " + i + " " + refreshTokens[i][String(id)])
              
              refreshTokens[i][id] = token;
              found = true;
            }
          }
        }
       if(!found){
        refreshTokens.push(temp)
       }

        return response.status(200).json({ accessToken, refreshToken, name , id, isAdmin });
      } else {
        return response
        .status(401)
        .json({ message: "Invalid Username/Password" });
      }
    } catch {
      return response.status(200).json({ accessToken, refreshToken,  name , id, isAdmin });
      
    }
  } else {
    console.log("Not : Found");
    return response.status(401).json({ message: "Invalid Username/Password" });
  }
});

app.delete("/api/v1/user/logout", (request, response) => {
  // Search the database for refresh-token then delete that token.
  const index = refreshTokens.indexOf(request.body.refreshToken);
  if (-1 < index) {
    refreshTokens.pop(index);
    response.status(204).send();
  }
});

function createAccessToken(user) {
  return jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: "1d" });
}
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
