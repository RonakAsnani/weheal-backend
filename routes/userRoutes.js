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
  addStress,
} = require("../controllers/userController");
const { protect, admin } = require("../middlewares/authMiddleware");

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
router.get("/fetch-expert-details", getExpertDetails);
router.get("/wallet-details", getWalletDetails);

router.get("/journal-details", getJournals);
router.post("/add-journal", addJournals);
router.post("/add-mood", addMood);
router.post("/add-stress", addStress);

module.exports = router;
