const express = require("express");
const connectToDb = require("../backend/db");
const userRoutes = require("./Routes/userRoutes");
const cors = require("cors");

const app = express();

const port = 5000;

connectToDb();

app.use(express.json());

app.use("/api/user", userRoutes);

app.listen(port, console.log(`server start with port ${port}`));
