const express = require("express");
const routes = express.Router();
const jwtauth = require("../config/middleware");
const { uploadImgPath } = require("../models/user");
const { login, profile, signup, remove } = require("../controller/user");

routes.post("/login", login);

routes.use(jwtauth);
routes.get("/profile", profile);
routes.delete("/remove", remove);
routes.post("/signup", uploadImgPath, signup);

module.exports = routes;
