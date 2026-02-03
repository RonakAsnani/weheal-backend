const mongoose = require("mongoose");

const staticDataSchema = new mongoose.Schema({
  dataType: { type: String },
  dataArray: { type: [String] },
  specialData: { type: String, default: "" },
});

// dailyEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("StaticData", staticDataSchema);
