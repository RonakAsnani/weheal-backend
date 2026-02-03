const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const Activity = require("../models/activityModel");
const DailyEntry = require("../models/trackModel");
const mongoose = require("mongoose");

const modifyActivity = asyncHandler(async (req, res) => {
  try {
    const {
      userId,
      title,
      description,
      category,
      activityId = null,
    } = req.body;
    if (activityId) {
      const updatedActivity = await Activity.findByIdAndUpdate(
        activityId,
        {
          $set: {
            title: title,
            description: description,
            category: category,
          },
        },
        { new: true }
      );

      return res.status(201).json(updatedActivity);
    } else {
      const newActivity = await Activity.create({
        userId,
        title,
        description,
        category,
      });
      const today = getTodayIST();
      await DailyEntry.findOneAndUpdate(
        { userId, date: today },
        { $inc: { activityTotal: 1 } },
        { upsert: true, new: true }
      );
      return res.status(201).json(newActivity);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error while updating the activity",
    });
  }

  return;
});

function getTodayIST() {
  const now = new Date();

  // IST is UTC + 5:30
  const utc = now.getTime() + now.getTimezoneOffset() * 60000; // convert local time to UTC
  const istOffset = 5.5 * 60 * 60 * 1000; // 5:30 in ms
  const istTime = new Date(utc + istOffset);

  // Return only the date part at midnight IST
  return new Date(istTime.getFullYear(), istTime.getMonth(), istTime.getDate());
}

const getUserActivities = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.query;
    const activities = await Activity.find({ userId }).sort({ createdAt: -1 });
    const today = getTodayIST();

    const dailyEntry = await DailyEntry.findOne({
      userId,
      date: today,
    });

    const skippedIds = dailyEntry?.activitySkipped?.map(String) || [];
    const completedIds = dailyEntry?.activityCompleted?.map(String) || [];

    // 3. Attach status to each activity
    const activitiesWithStatus = activities.map((act) => {
      const idStr = act._id.toString();
      let status = "pending";
      if (completedIds.includes(idStr)) status = "completed";
      else if (skippedIds.includes(idStr)) status = "skipped";
      return {
        ...act.toObject(),
        status,
      };
    });
    return res.status(201).json(activitiesWithStatus);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error while fetching the activities",
    });
  }

  return;
});

const updateActivityDailyStatus = asyncHandler(async (req, res) => {
  try {
    const { userId, activityId, status } = req.body;
    const today = getTodayIST();

    let dailyEntry = await DailyEntry.findOne({ userId, date: today });
    if (!dailyEntry) {
      dailyEntry = new DailyEntry({ userId, date: today });
    }

    // Remove from both arrays first (avoid duplicates)
    dailyEntry.activityCompleted = dailyEntry.activityCompleted.filter(
      (id) => id.toString() !== activityId
    );
    dailyEntry.activitySkipped = dailyEntry.activitySkipped.filter(
      (id) => id.toString() !== activityId
    );

    // Add to correct array
    if (status === "completed") {
      dailyEntry.activityCompleted.push(
        new mongoose.Types.ObjectId(activityId)
      );
    } else if (status === "skipped") {
      dailyEntry.activitySkipped.push(new mongoose.Types.ObjectId(activityId));
    }

    await dailyEntry.save();
    return res.status(201).json({ message: "Status updated" });
  } catch (err) {
    throw new Error("Error updating activity daily status: " + err.message);
  }
});

const deleteActivityAndUpdateDaily = asyncHandler(async (req, res) => {
  try {
    const { userId, activityId } = req.body;
    // 1. Delete the activity
    await Activity.findOneAndDelete({
      _id: activityId,
    });

    const today = getTodayIST();

    // 3. Update daily entry: remove this activity from skipped/completed if present
    await DailyEntry.findOneAndUpdate(
      { userId: userId, date: today },
      {
        $pull: {
          activitySkipped: activityId,
          activityCompleted: activityId,
        },
        $inc: { activityTotal: -1 },
      },
      { new: true }
    );

    res.status(201).json({ message: "Activity deleted" });
  } catch (err) {
    console.error(err);
    return { success: false, message: "Error deleting activity", error: err };
  }
});

module.exports = {
  modifyActivity,
  getUserActivities,
  updateActivityDailyStatus,
  deleteActivityAndUpdateDaily,
};
