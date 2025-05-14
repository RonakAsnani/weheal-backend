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

module.exports = { sendMail };
