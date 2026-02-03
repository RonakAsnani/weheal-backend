const mongoose = require("mongoose");

const dailyEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  date: { type: Date, required: true },

  activitySkipped: { type: [mongoose.Schema.Types.ObjectId] },
  activityCompleted: { type: [mongoose.Schema.Types.ObjectId] },
  activityTotal: { type: Number, default: 0 },
  // ✅ Daily wellness log
  journalAdded: { type: Boolean, default: false },
  moodAdded: { type: Boolean, default: false },
  stressAdded: { type: Boolean, default: false },
});

// dailyEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailyEntry", dailyEntrySchema);
