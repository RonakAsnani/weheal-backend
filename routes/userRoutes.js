const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/userController");
const { protect, admin } = require("../middlewares/authMiddleware");
const {
  modifyActivity,
  getUserActivities,
  updateActivityDailyStatus,
  deleteActivityAndUpdateDaily,
} = require("../controllers/activityController");
const { getDashboardMetrics } = require("../controllers/dashboardController");

// router.post("/login", authUser);
// router
//   .route("/profile")
//   .get(protect, getUserProfile)
//   .put(protect, updateUserProfile);
// router.route("/").post(registerUser).get(protect, admin, getUsers);
// router
//   .route("/:id")
//   .delete(protect, admin, deleteUser)
//   .get(protect, admin, getUserById)
//   .put(protect, admin, updateUser);

router.get("/check-user", checkUserByEmail);
router.post("/verify-user", verifyUser);
router.get("/get-otp", generateOtp);
router.post("/update-user", protect, updateUser);
router.get("/fetch-expert-details", protect, getExpertDetails);
router.get("/wallet-details", protect, getWalletDetails);
router.get("/get-track-data", protect, getUserTrackData);

router.get("/journal-details", protect, getJournals);
router.get("/get-questions", getQuestions);
router.post("/add-responses", protect, addQuestionresponses);
router.post("/add-journal", protect, addJournals);
// router.post("/add-mood", protect, addMood);
router.post("/add-checkin", protect, addCheckIn);
router.get("/get-users", getAssignedUsers);
router.get("/get-progress-data", getDashboardMetrics);

router.post("/modify-activity", protect, modifyActivity);
router.get("/get-activities", protect, getUserActivities);
router.post("/update-activity-status", protect, updateActivityDailyStatus);
router.post("/delete-activity", protect, deleteActivityAndUpdateDaily);
router.post("/send-request", protect, userCallBackMail);

module.exports = router;
