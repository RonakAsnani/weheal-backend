const User = require("../models/userModel");
const Otp = require("../models/otpModel");
const ExpertDetails = require("../models/expertDetailModel");
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../utils/generateTokens");
const { sendMail } = require("../utils/sendMail");
const Wallet = require("../models/walletModel");
const Journal = require("../models/journalModel");
const Mood = require("../models/moodModel");
const Stress = require("../models/StressModel");

const checkUserByEmail = asyncHandler(async (req, res) => {
  const { email } = req.query;
  console.log(email);
  const user = await User.findOne({ email: email });
  if (user) {
    return res.json({ exists: true });
  }
  return res.json({ exists: false });
});

const verifyUser = asyncHandler(async (req, res) => {
  const { code, email, name } = req.body;
  const otpUser = await Otp.findOne({ email: email });
  console.log("verifying");
  if (otpUser.otp != code) {
    return res.status(201).json({
      message: "Incorrect Otp",
    });
  }
  const currTime = new Date();
  if (currTime - otpUser.updatedAt > 5 * 60 * 1000) {
    return res.status(201).json({
      message: "Otp expired",
    });
  }
  // otpUser.otp = -1;
  // await otpUser.save();

  try {
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      console.log(userExists);
      return res.status(201).json({
        _id: userExists._id,
        email: userExists.email,
        name: userExists.name,
        isAdmin: userExists.isAdmin,
        bgCode: userExists.bgPicCode,
        number: userExists.number,
        profileCode: userExists.profilePicCode,
        assignedExpertId: userExists.assignedExpertId,
        walletId: userExists?.walletId,
        token: generateToken(userExists._id),
      });
    }
    const wallet = await Wallet.create({
      balance: 0,
      transactions: [],
    });
    const user = await User.create({
      email,
      name,
      bgPicCode: 0,
      profilePicCode: 0,
      walletId: wallet._id,
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        name: user.name,
        number: user.number,
        isAdmin: user.isAdmin,
        bgCode: userExists.bgPicCode,
        profileCode: userExists.profilePicCode,
        assignedExpertId: userExists.assignedExpertId,
        walletId: userExists?.walletId,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid new user");
    }
  } catch (error) {
    console.error("Session verification failed:", error);
    res.status(401).json({ message: "Invalid user" });
  }
});

const generateOtp = asyncHandler(async (req, res) => {
  const { email } = req.query;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpUser = await Otp.findOne({ email: email });
  if (otpUser) {
    otpUser.otp = otp;
    await otpUser.save();
  } else {
    const newotp = await Otp.create({
      email: email,
      otp: otp,
    });
  }
  console.log(email, otp);
  //   sendMail(email, otp);
  return res.status(201).json({
    message: "OTP sent",
  });
});

const updateUser = asyncHandler(async (req, res) => {
  try {
    console.log("saving");
    const updateData = req.body;
    const { email } = req.body;
    console.log(updateData);
    const user = await User.findOneAndUpdate({ email }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(201).json({ message: "User not found" });
    }
    console.log(user, "saved");
    return res.status(201).json({
      _id: user._id,
      email: user.email,
      name: user.name,
      number: user.number,
      isAdmin: user.isAdmin,
      bgPicCode: user.bgPicCode,
      profilePicCode: user.profilePicCode,
      assignedExpertId: user.assignedExpertId,
      walletId: user?.walletId,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(400).json({
      message: "Error while updating the user",
    });
  }

  return;
});

const getExpertDetails = asyncHandler(async (req, res) => {
  try {
    const { expert } = req.query;
    const user = await ExpertDetails.findOne({ userId: expert });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        number: user.number,
        image: user.image,
        experience: user.experience,
        details: user.details,
        userId: user.userId,
      });
    }
    res.status(400).json({
      message: "Expert not found",
    });
  } catch (error) {
    res.status(400).json({
      message: "Expert not found",
    });
  }
});

const getWalletDetails = asyncHandler(async (req, res) => {
  try {
    const { id } = req.query;

    const wallet = await Wallet.findOne({ _id: id });
    console.log(wallet);
    if (wallet) {
      res.status(201).json({
        _id: wallet._id,
        balance: wallet.balance,
        transactions: wallet.transactions,
      });
    }
    return res.status(400).json({
      message: "Cannot fetch balance now!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Cannot fetch balance now!",
    });
  }
});

const getJournals = asyncHandler(async (req, res) => {
  try {
    const { id } = req.query;

    const journals = await Journal.findOne({ userId: id });
    console.log(journals);
    if (journals) {
      res.status(201).json({
        _id: journals._id,
        journals: journals.journal,
      });
    } else {
      res.status(201).json({
        journals: [],
        _id: 0,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Cannot fetch entries now!",
    });
  }
});

const addJournals = asyncHandler(async (req, res) => {
  try {
    console.log("saving");
    const updateData = req.body;
    const { userId, title, description } = req.body;
    const entry = {
      title,
      description,
      createdAt: new Date(),
    };
    console.log(userId, updateData);
    const journalDoc = await Journal.findOneAndUpdate(
      { userId },
      { $push: { journal: entry } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(journalDoc, "saved");
    return res.status(201).json(journalDoc);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error while updating the journal",
    });
  }

  return;
});

const addMood = asyncHandler(async (req, res) => {
  try {
    console.log("saving");
    const updateData = req.body;
    const { userId, mood } = req.body;

    const moodEntry = await Mood.create({ userId, mood });

    console.log(moodEntry, "saved");
    return res.status(201).json(moodEntry);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error while updating the mood",
    });
  }

  return;
});

const addStress = asyncHandler(async (req, res) => {
  try {
    console.log("saving");
    const updateData = req.body;
    const { userId, socialStress, inteStress, phyStress } = req.body;

    const stressEntry = await Stress.create({
      userId,
      socialStress,
      inteStress,
      phyStress,
    });

    console.log(stressEntry, "saved");
    return res.status(201).json(stressEntry);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error while updating the mood",
    });
  }

  return;
});

module.exports = {
  checkUserByEmail,
  verifyUser,
  generateOtp,
  updateUser,
  getExpertDetails,
  getWalletDetails,
  getJournals,
  addJournals,
  addMood,
  addStress,
};
