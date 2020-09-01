// dependencies
require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const gameRoutes = require("./routes/game");
const criticRoutes = require("./routes/critic");
const userRoutes = require("./routes/user");

// global variables
const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;

// CORS security config
const whitelist = [
  "http://localhost:3000/",
  "https://gameratings.netlify.app/",
];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(
        new Error(
          "Not allowed by CORS; origin domain needs to be added to whitelist."
        )
      );
    }
  },
};

// middleware
NODE_ENV === "development" ? app.use(cors()) : app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

// routes and routers
app.use("/games", gameRoutes);
app.use("/critics", criticRoutes);
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Still working? Yup!");
});

//* USER AUTH

app.post("/login", authenticateToken, (req, res) => {
  //authenticate user

  const username = req.body.username;
  const user = { name: username };

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(""[1]);
  if ((token = null)) return res.status(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403);
    req.user = user;
    next();
  });
};

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};

// listener
app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}.`);
});
