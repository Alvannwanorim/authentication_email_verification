const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");

dotenv.config();
//Import database connection path
const connectDB = require("./db");

const app = express();

//middlewares
app.use(express.json());
app.use(morgan("dev"));

//Home Route
app.get("/", (req, res) => {
  res.send("<h1>Api is running</h1>");
});

const port = process.env.PORT || 5000;

connectDB();
app.listen(port, () => console.log(`App is running on port:${port}`));
