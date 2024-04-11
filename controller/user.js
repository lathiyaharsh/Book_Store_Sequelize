require("dotenv").config();
const { user, imgPath } = require("../models/user");
const { userMassage } = require("../config/message");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { hostname } = require("os");
const { log } = require("console");
const { prototype } = require("events");

const checkUser = async (email) => {
  try {
    const findUserDetails = await user.findOne({ where: { email } });
    if (findUserDetails) return true;
  } catch (error) {
    console.log(error);
  }
};

const deletefile = async (file) => {
  try {
    await fs.unlinkSync(file.path);
  } catch (error) {
    console.log(error);
  }
};

module.exports.signup = async (req, res) => {
  try {
    if (!req.body)
      return res.status(400).json({ message: userMassage.error.fillDetails });

    const { name, email, password, confirmpassword, gender, interest } =
      req.body;

    if (password.length <= 6 || password.length >= 20)
      return res.status(400).json({ message: userMassage.error.password });
    
    if (confirmpassword !== password) {
      return res
        .status(400)
        .json({ message: userMassage.error.passwordNotMatch });
    }

    const findUser = await checkUser(email);

    if (findUser) {
      await deletefile(req.file);
      return res.status(400).json({
        message: userMassage.error.invalidEmail,
      });
    }
   
    let image = "";
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      console.log(baseUrl);
      image = baseUrl+ imgPath + "/" + req.file.filename;
    }

    const newUser = {
      name,
      email,
      gender,
      interest,
      image,
      password: await bcrypt.hash(password, 10),
    };

    const createUser = await user.create(newUser);

    if (!createUser)
      return res.status(400).json({ message: userMassage.error.signUperror });

    return res.status(201).json({ message: userMassage.success.signUpSuccess });
  } catch (error) {
    if(req.file) await deletefile(req.file);
    if (error.name === "SequelizeValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ errors });
    }
    console.log(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const findUser = await user.findOne({ where: { email } });

    if (!findUser)
      return res.status(404).json({ message: userMassage.error.userNotFound });

    const isValidPassword = await bcrypt.compare(password, findUser.password);

    {
      const { id, name, email, gender, image, interest } = findUser;
      const userDetails = {
        id,
        name,
        email,
        gender,
        image,
        interest,
      };

      const token = isValidPassword
        ? await jwt.sign({ data: userDetails }, process.env.SECRETKEY, {
            expiresIn: "1h",
          })
        : null;

      if (isValidPassword) {
        return res.status(200).json({
          message: userMassage.success.loginSuccess,
          token,
        });
      }
    }

    return res.status(400).json({ message: userMassage.error.wrongPassword });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};

module.exports.profile = async (req, res) => {
  try {
    const { name, email, gender, interest, image } = req.user.data;
    const userDetails = {
      name,
      email,
      gender,
      interest,
      image,
    };

    return res.status(200).json({
      message: userMassage.success.profileRetrieved,
      profile: userDetails,
    });
  } catch (error) {
    return res.status(404).json({ message: userMassage.error.genericError });
  }
};

module.exports.remove = async (req, res) => {
  try {
    const { id, image } = req.user.data;
    const deleteUser = await user.destroy({ where: { id } });

    if (!deleteUser)
      return res.status(400).json({ message: userMassage.error.delete });

    try {
      if (image) {
        const parsedUrl = new URL(image);
        const imagePath = parsedUrl.pathname;
        const fullPath = path.join(__dirname, "..", imagePath);
        await fs.unlinkSync(fullPath);
      }
    } catch (error) {
      return res.status(404).json({ message: userMassage.success.delete });
    }

    return res.status(200).json({ message: userMassage.success.delete });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: userMassage.error.userNotFound });
  }
};
