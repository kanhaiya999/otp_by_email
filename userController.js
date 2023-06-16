const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const Otp = require("../model/otpStore");
const axios = require("axios");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "kanhaiyalalkesar@gmail.com",
    pass: "mivrvjjolhmggrdc",
  },
});

const registerUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const otp = generateOTP();

  const mailOptions = {
    from: "kanhaiyalalkesar@gmail.com",
    to: email,
    subject: "OTP for verification",
    text: `For Chat App Sign Up: Your OTP is: ${otp}`,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);

    let otpUser = await Otp.findOne({ email });

    if (otpUser) {
      otpUser.otp = otp;
      // Save the updated record
      otpUser = await otpUser.save();
    } else {
      otpUser = await Otp.create({
        email,
        otp,
      });
    }

    // Call the OTP verification API
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const otpVerificationPromise = axios.post(
      "http://localhost:5000/api/user/otpVerify",
      {
        email,
        otp,
      },
      config
    );

    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        resolve({ status: 400 });
      }, 60000);
    });

    // Wait for either the OTP verification response or the timeout
    const result = await Promise.race([otpVerificationPromise, timeoutPromise]);
    // console.log(result);
    if (result.status === 200 && result.data.status === "success") {
      res.status(200).send("Success: Account created successfully");
    } else {
      res.status(400).send("Failed to create account");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending email");
  }
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const otpVerifyEmail = await Otp.findOne({ email });
  if (!otpVerifyEmail) {
    res.status(400).send({ Error: "Email not found" });
    return;
  }

  if (otpVerifyEmail.otp !== otp) {
    res.status(400).send({ Error: "Incorrect OTP" });
    return;
  }

  const prevDate = otpVerifyEmail.updatedAt;
  const now = new Date();
  const diffInMinutes = Math.floor((now - prevDate) / (1000 * 60));

  if (diffInMinutes > 0) {
    res.status(400).send({ Error: "OTP has expired" });
    return;
  }

  res.status(200).send({ status: "success" });
});

module.exports = { registerUser, verifyOTP };
