const catchAsyncError = require("../middlewares/catchAsyncError");
const { ErrorHandler } = require("../middlewares/error");
const User = require("../models/.userModel");
const sendEmail = require("../utils/sendEmail");
const twilio = require("twilio");

const client = twilio(process.env.TWILLIO_SID, process.env.TWILLIO_AUTH_TOKEN);

const register = catchAsyncError(async (req, res, next) => {
  try {
    const { name, phone, password, verificationMethod } = req.body;
    if (!name || !phone || !password || !verificationMethod) {
      return next(new ErrorHandler("All filed are reuired", 400));
    }

    function validPhoneNumber(phone) {
      const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
      return phoneRegex.test(phone);
    }

    if (!validPhoneNumber(phone)) {
      return next(new ErrorHandler("Invalid phone number.", 400));
    }

    const existingUser = await User.findOne({
      $or: [
        {
          email,
          accountVerified: true,
        },
        {
          phone,
          accountVerified: true,
        },
      ],
    });

    if (existingUser) {
      return next(new ErrorHandler("phone or Email is already used", 400));
    }

    const registertionAttemptsByUser = await User.find({
      $or: [
        { phone, accountVerified: false },
        { email, accountVerified: false },
      ],
    });

    if (registertionAttemptsByUser.length > 3) {
      return next(
        new ErrorHandler(
          "You have exceeded the maximum number of attempts(3). please try again after an hour.",
          400
        )
      );
    }

    const userData = {
      name,
      email,
      phone,
      password,
    };

    const user = User.create(userData);

    const verificationCode = await user.generateVerificationcode();
    await user.save();
    sendVerificationCode(verificationMethod, verificationCode, email, phone);

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
});

async function sendVerificationCode(
  verificationMethod,
  verificationCode,
  email,
  phone
) {
  try {
    if (verificationMethod === "email") {
      const message = generateEmailTemplate(verificationCode);
      sendEmail({ email, subject: "your vetification Code", message });
    } else if (verificationMethod === "phone") {
      const verificationCodeWithSpace = verificationCode
        .toString()
        .split("")
        .json(" ");
      await client.calls.create({
        twiml: `
        <Response>
          <Say>your verification code is ${verificationCodeWithSpace}. Your verificiton code is ${verificationCodeWithSpace}</Say>
        </Response>
      `,
        from: process.env.TWILLIO_PHONE_NUMBER,
        to: phone,
      });
    } else {
      throw new ErrorHandler("Invalid verifiction method.", 500);
    }
  } catch (error) {
          throw new ErrorHandler("Failed to send cerifiction code.", 500);

  }
}

const generateEmailTemplate = (verificationCode) => {
  return `
        <div style="font-family: Arial, sans-serif; padding:20px;">
          <h2>Email Verification</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <h1 style="letter-spacing:5px;">${verificationCode}</h1>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>Please do not share this OTP with anyone.</p>
        </div>`;
};
