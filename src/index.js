require("dotenv").config();

const express = require("express");
const app = express();
const PORT = process.env.PORT || 7000;

app.get("/", (req, res) => {
  res.send("Hello  Treewit World!");
});

app.listen(PORT, () => {
  console.log(`Example app listening http://localhost:${PORT}`);
});
