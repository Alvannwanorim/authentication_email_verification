const express = require("express");

const app = express();

//middlewares
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>Api is running</h1>");
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`App is running on port${port}`));
