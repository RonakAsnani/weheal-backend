// utils/notificationService.js
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const sendNotification = async (user, message) => {
  if (!user.fcmToken) return;

  const payload = {
    notification: {
      title: "New Message",
      body: message,
    },
    token: user.fcmToken,
  };

  try {
    await admin.messaging().send(payload);
    console.log("Notification sent successfully");
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

module.exports = { sendNotification };
