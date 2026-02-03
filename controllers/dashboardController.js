const { Types } = require("mongoose");
const DailyEntry = require("../models/trackModel");
const Activity = require("../models/activityModel");
const Mood = require("../models/moodModel");
const Stress = require("../models/StressModel");
const asyncHandler = require("express-async-handler");

// --- IST DATE HELPER ---

/**
 * Calculates today's date adjusted to IST (UTC +5:30) midnight.
 */
function getTodayIST() {
  const currentTime = new Date();
  const currentOffset = currentTime.getTimezoneOffset();
  const ISTOffset = 330; // IST offset UTC +5:30 (330 minutes)

  const istTime = new Date(
    currentTime.getTime() + (ISTOffset + currentOffset) * 60000
  );

  // Return only the date part at midnight IST (00:00:00.000 IST)
  return new Date(istTime.getFullYear(), istTime.getMonth(), istTime.getDate());
}

// --- MOCK DEPENDENCIES END ---

const getDashboardMetrics = asyncHandler(async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(500).json({ message: "user id not present" });
  }
  const userObjectId = new Types.ObjectId(userId);
  const todayIst = getTodayIST(); // Reference point for today at 00:00:00 IST

  // --- 1. Fetch Daily Entries ---
  const allEntries = await DailyEntry.find({ userId: userObjectId });

  // Create a map for quick lookup of entries by their IST date timestamp
  const dateToEntryMap = new Map();
  allEntries.forEach((entry) => {
    // Normalize the stored entry date to IST midnight for accurate comparison
    const istNormalizedDate = new Date(
      entry.date.getFullYear(),
      entry.date.getMonth(),
      entry.date.getDate()
    );
    dateToEntryMap.set(istNormalizedDate.getTime(), entry);
  });

  const uniqueDatesLogged = [...dateToEntryMap.keys()].sort((a, b) => b - a); // Sort descending (recent first)

  // --- 2. Streak Calculation (Based on IST Days) ---
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let checkTime = todayIst.getTime();

  // Current Streak
  for (let i = 0; i < 365; i++) {
    if (dateToEntryMap.has(checkTime)) {
      currentStreak++;
    } else if (i > 0) {
      break;
    }
    checkTime -= 24 * 60 * 60 * 1000;
  }

  // Longest Streak
  if (uniqueDatesLogged.length > 0) {
    tempStreak = 1;
    for (let i = 1; i < uniqueDatesLogged.length; i++) {
      const previousEntryTime = uniqueDatesLogged[i - 1];
      const currentEntryTime = uniqueDatesLogged[i];
      const dayDifference =
        (previousEntryTime - currentEntryTime) / (24 * 60 * 60 * 1000);

      if (dayDifference <= 1.5) {
        tempStreak++;
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // --- 3. Consistency and Today's Status ---
  const consistencyDays = [];
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(todayIst);
    checkDate.setDate(todayIst.getDate() - (6 - i));
    const isLogged = dateToEntryMap.has(checkDate.getTime());
    consistencyDays.push(isLogged);
  }

  const isTodayLogged = dateToEntryMap.has(todayIst.getTime());
  const todayLog = isTodayLogged
    ? dateToEntryMap.get(todayIst.getTime())
    : null;
  const todayStatus = todayLog
    ? {
        journalAdded: todayLog.journalAdded,
        moodAdded: todayLog.moodAdded !== undefined, // Check for level presence
        stressAdded: todayLog.stressAdded !== undefined, // Check for level presence
        dailyActivities: {
          total: todayLog.activityTotal || 0,
          completed: todayLog.activityCompleted
            ? todayLog.activityCompleted.length
            : 0,
        },
      }
    : {
        journalAdded: false,
        moodAdded: false,
        stressAdded: false,
        dailyActivities: { total: 0, completed: 0 },
      };

  // --- 4. Activity Processing and Name Mapping (Unchanged) ---
  const thirtyDaysAgo = new Date(todayIst);
  thirtyDaysAgo.setDate(todayIst.getDate() - 30);

  const recentEntries = allEntries.filter((entry) => {
    const entryNormalizedIst = new Date(
      entry.date.getFullYear(),
      entry.date.getMonth(),
      entry.date.getDate()
    ).getTime();
    return entryNormalizedIst >= thirtyDaysAgo.getTime();
  });

  let totalActivitiesCount = 0;
  let completedActivitiesCount = 0;
  const activityCounts = {}; // { activityId: { completed: N, skipped: M } }
  const activityIdsToFetch = new Set();

  recentEntries.forEach((entry) => {
    totalActivitiesCount += entry.activityTotal || 0;
    completedActivitiesCount += entry.activityCompleted
      ? entry.activityCompleted.length
      : 0;

    (entry.activityCompleted || []).forEach((id) => {
      const activityId = id.toString();
      activityIdsToFetch.add(activityId);
      activityCounts[activityId] = activityCounts[activityId] || {
        completed: 0,
        skipped: 0,
      };
      activityCounts[activityId].completed++;
    });
    (entry.activitySkipped || []).forEach((id) => {
      const activityId = id.toString();
      activityIdsToFetch.add(activityId);
      activityCounts[activityId] = activityCounts[activityId] || {
        completed: 0,
        skipped: 0,
      };
      activityCounts[activityId].skipped++;
    });
  });

  const activityDocuments = await Activity.find({
    _id: { $in: Array.from(activityIdsToFetch) },
  });
  const idToNameMap = activityDocuments.reduce((map, doc) => {
    map[doc._id] = doc.title;
    return map;
  }, {});

  const completionRate =
    totalActivitiesCount > 0
      ? Math.round((completedActivitiesCount / totalActivitiesCount) * 100)
      : 0;

  const sortedActivities = Object.entries(activityCounts).map(
    ([id, counts]) => ({ id, ...counts })
  );

  const topCompleted = sortedActivities
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 3)
    .map((a) => idToNameMap[a.id] || "Unknown Activity");

  const topSkipped = sortedActivities
    .sort((a, b) => b.skipped - a.skipped)
    .slice(0, 3)
    .map((a) => idToNameMap[a.id] || "Unknown Activity");

  const [moodRecords, stressRecords] = await Promise.all([
    Mood.find({ userId: userObjectId })
      .sort({ createdAt: -1 }) // newest first
      .limit(7),
    Stress.find({ userId: userObjectId }).sort({ createdAt: -1 }).limit(7),
  ]);

  // 5b. Simply extract the level and label data directly from the records.
  const trendData = { moodTrend: [], stressTrend: [], labels: [] };
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  moodRecords.forEach((record) => {
    trendData.moodTrend.push(record.mood);
  });

  stressRecords.forEach((record) => {
    trendData.stressTrend.push(record.stress);
  });
  return res.status(201).json({
    streak: currentStreak,
    longestStreak: longestStreak,
    isTodayLogged: isTodayLogged,
    consistencyDays: consistencyDays,
    completionRate: completionRate,
    dailyActivities: todayStatus.dailyActivities,
    wellnessLog: {
      journalAdded: todayStatus.journalAdded,
      moodAdded: todayStatus.moodAdded,
      stressAdded: todayStatus.stressAdded,
    },
    topCompleted,
    topSkipped,
    // Passing the latest 7 days for the frontend chart visualization
    moodTrend: trendData.moodTrend,
    stressTrend: trendData.stressTrend,
    trendLabels: [1, 2, 3, 4, 5, 6, 7],
  });
});

module.exports = {
  getDashboardMetrics,
};
