const nodejsmailer = require("nodemailer");

var transporter = nodejsmailer.createTransport({
  secure: true,
  port: 465,
  host: "smtp.gmail.com",
  auth: {
    user: "ronakasnani5@gmail.com",
    pass: "rjrdnlvqrldlsgtg",
  },
});

function sendMail(to, otp) {
  console.log(to, otp);
  transporter.sendMail({
    to: to,
    subject: "OTP for Healzo",
    html: `Your OTP for Login is ${otp} `,
  });
}

function sendNotificationMail(to, user, type) {
  console.log(to, user, type);
  transporter.sendMail({
    to: to,
    subject: `${type} request from ${user}`,
    html: `${user} has raised a request for ${type}, please contact them as soon as possible by email or phone`,
  });
}

module.exports = { sendMail, sendNotificationMail };

//$env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.0.110"; npx expo start --host lan
