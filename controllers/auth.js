const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModels");

//@desc REGISTER USER
//@route POST: /api/users/auth/register
//access Public

exports.register = async (req, res) => {
  const { firstName, lastName, email, password, phone, age } = req.body;
  const errors = validationResult(req);

  //check for validation errors
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array(),
    });
  }

  try {
    //check for existing user: email
    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      age,
      phone,
      password: hashPassword,
    });

    await newUser.save();

    res.status(201).json({
      user: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

//@desc REGISTER USER
//@route POST: /api/users/auth/register
//access Public

exports.registerTutor = async (req, res) => {
  const { firstName, lastName, email, password, phone, gender } = req.body;
  const errors = validationResult(req);

  //check for validation errors
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array(),
    });
  }

  try {
    //check for existing user: email
    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      gender,
      phone,
      password: hashPassword,
    });

    await newUser.save();

    res.status(201).json({
      user: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        gender: newUser.gender,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

//@desc LOGIN USER
//@route POST: /api/users/auth/login
//access Public

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  //check for validation errors
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array(),
    });
  }

  try {
    //check if user exists
    const user = await User.findOne({ email });

    //if user does not exist return error message
    if (!user) {
      return res.status(400).json({
        message: "User does not exist",
      });
    }
    //check for password validity
    const isMatch = await bcrypt.compare(password, user.password);

    //return error message for password missmatch
    if (!isMatch) {
      return res.status(400).json({
        statusCode: 400,
        message: "password is incorrect",
      });
    }

    const payload = {
      user: {
        id: user._id,
      },
    };

    const token = await jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      statusCode: 200,
      user: {
        firstName: user.firstName,
        LastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage,
        phone: user.phone,
      },
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      statusCode: 500,
      message: "Server error",
    });
  }
};

//@desc GET USER
//@route  GET: /api/users/auth/
//access Private

exports.getUser = async (req, res) => {
  const id = req.user.id;
  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(400).json({
        message: "User does not exist",
      });
    }

    res.status(200).json({
      statusCode: 200,
      user: {
        firstName: user.firstName,
        LastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      statusCode: 500,
      message: "Server error",
    });
  }
};

//@desc UPDATE USER PROFILEIMAGE
//@route  GET: /api/users/auth/profile/:id
//access Private

exports.updateProfile = async (req, res) => {
  const { profileImage, phone } = req.body;
  const id = req.user.id;
  try {
    const user = User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (id !== user._id.toString()) {
      return res.status(403).json({
        message: "User not authorized",
      });
    }
    user.profileImage = profileImage;
    user.phone = phone;

    await user.save();
    res.status(200).json({
      statusCode: 200,
      user: {
        firstName: user.firstName,
        LastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      statusCode: 500,
      message: "Server error",
    });
  }
};

//@desc UPDATE USER PASSWORD
//@route  GET: /api/users/auth/password/:id
//access Private

exports.updatePassword = async (req, res) => {
  const { password } = req.body;
  const id = req.user.id;
  try {
    const user = User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (id !== user._id.toString()) {
      return res.status(403).json({
        message: "User not authorized",
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;

    await user.save();

    res.status(201).json({
      statusCode: 201,
      message: "Password updated",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      statusCode: 500,
      message: "Server error",
    });
  }
};

//@desc DELETE USER
//@route  GET: /api/users/auth/:id
//access Private
exports.deleteUser = async (req, res) => {
  const userId = req.user.id;

  try {
    if (userId.toString !== req.params.id) {
      return res.status(403).json({
        message: "User not authorized",
      });
    }
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
      });
    }

    if (userId !== user._id.toString()) {
      return res.status(403).json({
        statusCode: 403,
        message: "User not authorized",
      });
    }

    await user.remove();
    res.status(200).json({
      statusCode: 200,
      message: "User remove sucessfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      statusCode: 500,
      message: "Server error",
    });
  }
};
