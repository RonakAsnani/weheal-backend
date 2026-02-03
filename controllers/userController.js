const User = require("../models/userModel");
const Otp = require("../models/otpModel");
const ExpertDetails = require("../models/expertDetailModel");
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../utils/generateTokens");
const { sendMail, sendNotificationMail } = require("../utils/sendMail");
const Wallet = require("../models/walletModel");
const Journal = require("../models/journalModel");
const Mood = require("../models/moodModel");
const Stress = require("../models/StressModel");
const Question = require("../models/questionsModel");
const DailyEntry = require("../models/trackModel");
const Activity = require("../models/activityModel");
const mongoose = require("mongoose");
const staticDataModel = require("../models/staticDataModel");

const checkUserByEmail = asyncHandler(async (req, res) => {
  const { email } = req.query;
  const user = await User.findOne({ email: email });
  if (user) {
    return res.status(201).json({ exists: true });
  }
  return res.status(201).json({ exists: false });
});

const verifyUser = asyncHandler(async (req, res) => {
  const { code, email, name } = req.body;
  const otpUser = await Otp.findOne({ email: email });
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
      return res.status(201).json({
        _id: userExists._id,
        email: userExists.email,
        name: userExists.name,
        isAdmin: userExists.isAdmin,
        bgPicCode: userExists.bgPicCode,
        number: userExists.number,
        profilePicCode: userExists.profilePicCode,
        assignedExpertId: userExists.assignedExpertId,
        walletId: userExists?.walletId,
        token: generateToken(userExists._id),
        new: userExists.responses == null,
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
      assignedExpertId: "6807c4577967cdb0411faf48",
      walletId: wallet._id,
    });
    const today = getTodayIST();
    entry = await DailyEntry.create({
      userId: user._id,
      date: today,
      activitySkipped: [],
      activityCompleted: [],
      activityTotal: 2,
      journalAdded: false,
      moodAdded: false,
      stressAdded: false,
      loggedIn: false,
    });
    const defaultActivities = [
      {
        userId: user._id,
        title: "Check In with guide",
        description: "",
        category: "Learning",
      },
      {
        userId: user._id,
        title: "Write a journal entry",
        description: "",
        category: "Learning",
      },
    ];
    defaultActivities.forEach(async (act) => {
      await Activity.create(act);
    });
    if (user) {
      res.status(201).json({
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
        new: true,
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
  // console.log(email, otp);
  sendMail(email, otp);
  return res.status(201).json({
    message: "OTP sent",
  });
});

const updateUser = asyncHandler(async (req, res) => {
  try {
    const updateData = req.body;
    const { email } = req.body;
    const user = await User.findOneAndUpdate({ email }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(201).json({ message: "User not found" });
    }
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
        message: user.message,
        userId: user.userId,
        languages: user.languages,
        qualifications: user.qualifications,
        whatIOffer: user.whatIOffer,
        whenPeopleReachOut: user.whenPeopleReachOut,
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
    const user = await User.findById(id);
    const wallet = await Wallet.findOne({ _id: user.walletId });
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
    const sortedJournals = journals.journal.sort(
      (a, b) => b.createdAt - a.createdAt
    );
    if (sortedJournals) {
      res.status(201).json({
        // _id: sortedJournals._id,
        journals: sortedJournals,
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

const getQuestions = asyncHandler(async (req, res) => {
  try {
    const questions = await Question.find();

    if (questions) {
      return res.status(201).json({
        questions: questions[0].questions,
      });
    } else {
      return res.status(201).json({
        questions: [],
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Cannot fetch questions now!",
    });
  }
});

const addJournals = asyncHandler(async (req, res) => {
  try {
    const updateData = req.body;
    const { userId, title, description } = req.body;
    const entry = {
      title,
      description,
      createdAt: new Date(),
    };
    const journalDoc = await Journal.findOneAndUpdate(
      { userId },
      { $push: { journal: entry } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    const today = getTodayIST();
    await DailyEntry.findOneAndUpdate(
      { userId, date: today },
      { $set: { journalAdded: true } },
      { upsert: true, new: true }
    );
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
    const updateData = req.body;
    const { userId, mood } = req.body;

    const moodEntry = await Mood.create({ userId, mood });
    const today = getTodayIST();
    await DailyEntry.findOneAndUpdate(
      { userId, date: today },
      { $set: { moodAdded: true } },
      { upsert: true, new: true }
    );
    return res.status(201).json(moodEntry);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error while updating the mood",
    });
  }

  return;
});

const addCheckIn = asyncHandler(async (req, res) => {
  try {
    const updateData = req.body;
    const { userId, stress, mood } = req.body;

    await Stress.create({
      userId,
      stress,
    });
    await Mood.create({
      userId,
      mood,
    });
    const today = getTodayIST();
    await DailyEntry.findOneAndUpdate(
      { userId, date: today },
      { $set: { stressAdded: true, moodAdded: true } },
      { upsert: true, new: true }
    );
    return res.status(201).json({ message: "Checked In successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error while updating the mood",
    });
  }

  return;
});

const getAssignedUsers = asyncHandler(async (req, res) => {
  try {
    const { id } = req.query;
    const users = await User.find({
      assignedExpertId: id,
    });

    if (users) {
      return res.status(201).json({
        // _id: sortedJournals._id,
        users: users,
      });
    } else {
      return res.status(201).json({
        users: [],
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

function getTodayIST() {
  var currentTime = new Date();

  var currentOffset = currentTime.getTimezoneOffset();

  var ISTOffset = 330; // IST offset UTC +5:30

  var istTime = new Date(
    currentTime.getTime() + (ISTOffset + currentOffset) * 60000
  );

  // Return only the date part at midnight IST
  return new Date(istTime.getFullYear(), istTime.getMonth(), istTime.getDate());
}

function isNotOlderThanOneDay(dateString) {
  const inputDate = new Date(dateString);
  const now = new Date();

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  return now - inputDate <= ONE_DAY_MS;
}

const getUserTrackData = asyncHandler(async (req, res) => {
  try {
    const { id } = req.query;
    const today = getTodayIST();

    let entry = await DailyEntry.findOne({ userId: id, date: today });
    if (!entry) {
      const totalActivities = await Activity.countDocuments({ userId: id });
      entry = await DailyEntry.create({
        userId: id,
        date: today,
        activitySkipped: [],
        activityCompleted: [],
        activityTotal: totalActivities,
        journalAdded: false,
        moodAdded: false,
        stressAdded: false,
        loggedIn: false,
      });
    }
    user = await User.findById(id);

    const expertUser = await ExpertDetails.findOne({
      userId: user.assignedExpertId,
    });
    var name = "";
    var expertPic = "";
    if (expertUser) {
      name = expertUser.name;
      expertPic = expertUser.image;
    }

    wallet = await Wallet.findById(user.walletId);
    const staticData = await staticDataModel.find();

    const dayNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // days since epoch

    let quote = null;
    let journal = null;

    for (const item of staticData) {
      const { dataType, dataArray, specialData } = item;
      if (specialData && specialData.length > 0) {
        if (dataType == "journal") {
          journal = specialData;
        } else if (dataType == "quote") {
          quote = specialData;
        }
      } else {
        const index = dayNumber % dataArray.length;
        if (dataType == "journal") {
          journal = dataArray[index];
        } else if (dataType == "quote") {
          quote = dataArray[index];
        }
      }

      // Pick one based on dayNumber
    }

    return res.status(201).json({
      track: entry,
      quote: quote,
      prompt: journal,
      balance: wallet?.balance,
      expertName: name,
      expertPic: expertPic,
      newAccount: isNotOlderThanOneDay(user.createdAt),
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Cannot fetch entries now!",
    });
  }
});

const userCallBackMail = asyncHandler(async (req, res) => {
  const { userEmail, expertId, type } = req.body;
  if (type == "Evaluation") {
    const user = await User.findOne({ email: userEmail });
    const wallet = await Wallet.findById(user.walletId);
    if (wallet.balance >= 100) {
      const updatedWallet = await Wallet.findByIdAndUpdate(
        user.walletId,
        {
          $inc: { balance: -100 },
          $push: {
            transactions: {
              description: "Evaluation request",
              amount: 100,
              added: false,
              createdAt: new Date(),
            },
          },
        },
        { new: true }
      );
    } else {
      return res.status(411).json({ message: "Not enough balance" });
    }
  }
  // const expert = await User.findOne({ _id: expertId });
  // sendNotificationMail(expert.email, userEmail, type);
  return res.status(201).json({ message: "Request completed" });
});

const addQuestionresponses = asyncHandler(async (req, res) => {
  try {
    const { selectedOptions, userId } = req.body;
    const valueMap = {
      "never-": 0,
      "sometimes-": 1,
      "often-": 2,
      "almost-always-": 3,
    };
    // 2. Parameter weights per question index
    const parameterMap = {
      0: { stress: 1 },
      1: { anxiety: 1 },
      2: { anxiety: 0.7, sleep: 0.3 },
      3: { mood: 1 },
      4: { mood: 0.6, social: 0.4 },
      5: { sleep: 1 },
      6: { social: 1 },
      7: { stress: 0.5, mood: 0.5 },
    };
    // 3. Initialize raw scores & max scores
    const rawScores = {
      stress: 0,
      anxiety: 0,
      sleep: 0,
      mood: 0,
      social: 0,
    };

    const maxScores = {
      stress: 0,
      anxiety: 0,
      sleep: 0,
      mood: 0,
      social: 0,
    };
    // 4. Iterate responses
    for (const [qIndex, options] of Object.entries(selectedOptions)) {
      var answer = options[0]; // single-choice
      const value = valueMap[answer + "-"];
      const weights = parameterMap[qIndex];

      for (const [param, weight] of Object.entries(weights)) {
        rawScores[param] += value * weight;
        maxScores[param] += 3 * weight; // 3 = max option value
      }
    }
    // 5. Normalize scores (0–10)
    const scores = {};
    for (const param in rawScores) {
      scores[param] = Number(
        ((rawScores[param] / maxScores[param]) * 10).toFixed(1)
      );
    }

    // 6. Severity helper
    const getSeverity = (score) => {
      if (score <= 2) return "Healthy";
      if (score <= 4) return "Mild";
      if (score <= 6) return "Moderate";
      return "High";
    };
    // 7. Category detection
    const categories = [];

    if (scores.anxiety >= 5 && scores.sleep >= 5) {
      categories.push("Anxiety-Prone Pattern");
    }

    if (scores.sleep >= 5) {
      categories.push("Sleep Disruption Tendency");
    }

    if (scores.stress >= 7) {
      categories.push("High Stress Profile");
    }

    if (scores.mood >= 7 && scores.social >= 6) {
      categories.push("Low Mood & Social Withdrawal");
    }
    // 8. Overall severity
    const overallSeverity = Object.values(scores).some((s) => s >= 7)
      ? "High"
      : Object.values(scores).some((s) => s >= 5)
      ? "Moderate"
      : "Mild";

    await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          responses: {
            selectedOptions,
            scores,
            severityByParameter: {
              stress: getSeverity(scores.stress),
              anxiety: getSeverity(scores.anxiety),
              sleep: getSeverity(scores.sleep),
              mood: getSeverity(scores.mood),
              social: getSeverity(scores.social),
            },
            categories,
            overallSeverity,
            primaryFocus: categories.map((c) =>
              c.toLowerCase().replace(/ /g, "_")
            ),
          },
        },
      },
      { upsert: true, new: true }
    );
    return res.status(201).json({ message: "Responses saved" });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error while updating the responses",
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
  addCheckIn,
  getQuestions,
  getAssignedUsers,
  getUserTrackData,
  userCallBackMail,
  addQuestionresponses,
};
