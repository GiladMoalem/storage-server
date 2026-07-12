import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("hello world!");
});

app.listen(3000, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:3000`);
});
