require("dotenv").config();
require("./models/index");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const path = require("path");
const cors = require('cors');
const bodyParser = require('body-parser')
app.use(cors());

app.use(express.json());

app.use(express.urlencoded());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", require("./routes/index"));
app.use("/auth", require("./routes/user"));

app.listen(process.env.PORT, (err) => {
  err
    ? console.log("Server error")
    : console.log(`Server Started  On ${process.env.PORT}`);
});
