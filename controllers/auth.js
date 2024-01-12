import Users from "../models/Users.js";
import JWT from "jsonwebtoken";
import {
  signUpBodyValidation,
  loginValidation,
  refershTokenValidation
} from "../utils/validationSchema.js";
import { generateTokens, verifyRefreshToken } from "../utils/generateTokens.js";
import UserTokens from "../models/UserTokens.js";
import fs from "fs";
import customResponse from "../utils/customResponse.js";

export const signUp = async (req, res, next) => {
  try {
    const { error } = signUpBodyValidation(req.body);
    const uploadedFile = req.file;
    if (error) {
      if (uploadedFile?.filename)
        fs.unlinkSync("uploads/dp/" + uploadedFile.filename);
      return customResponse(req, res, 400, { status: "error", message: error?.details[0]?.message }, true);
    }

    let user = await Users.findOne({ email: req.body.email });
    if (user) {
      if (uploadedFile?.filename)
        fs.unlinkSync("uploads/dp/" + uploadedFile.filename);
      return customResponse(req, res, 400, { status: "error", message: "User already exists" }, true);
    }
    req.body.dp = uploadedFile?.filename || "";
    user = await Users.create(req.body);

    const data = await generateTokens(user);

    return customResponse(req, res, 201, {
      status: "success",
      data,
      message: "User created successfully.",
    }, true);

  } catch (e) {
    return customResponse(req, res, 500, { status: "error", message: "Internal server error" }, true);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { error } = loginValidation(req.body);
    if (error) {
      return customResponse(req, res, 400, { status: "error", message: error?.details[0]?.message }, true);
    }

    let user = await Users.findOne({
      $or: [{ email: req.body.email }, { mobile: req.body.mobile }],
    });
    if (!user) {
      return customResponse(req, res, 404, {
        status: "error",
        message: "User is not registered having given email id or mobile number."
      }, true);
    }

    if (! await user.comparePassword(req.body.password)) {
      return customResponse(req, res, 401,{ status: "error", message: "Invalid username or password." }, true);
    }    
    const data = await generateTokens(user);
    data.user = user;
    return customResponse(req, res, 200,{
      status: "success",
      data,
      message: "Login successfully",
    }, true);

  } catch (e) {
    global.log.error(` Internal server Error SignIn - ${JSON.stringify({e: e.stack})}`);
    return customResponse(req, res, 500,{ status: "error", message: "Internal server error" }, true);
  }
};

export const signOut = async (req, res, next) => {
  try {
    const { error } = refershTokenValidation(req.body);
    if (error) {
        return customResponse(req, res, 400,{ status: "error", message: error?.details[0]?.message }, true);
    }

    const userToken = await UserTokens.findOne({
      token: req.body.refreshToken,
    });

    if (userToken) {
      await UserTokens.deleteMany({ token: req.body.refreshToken });
    }
    return customResponse(req, res, 200,{
      status: "success",
      message: "Sign out successfully",
    }, true);

  } catch (e) {
    global.log.error(` Internal server Error Signout - ${JSON.stringify({e: e.stack})}`);
    return customResponse(req, res, 500,{ status: "error", message: "Internal server error" }, true);
  }
};

export const verifyRefreshTokenAndGetAccessToken = async (req, res, next) => {
  try {
    const { error } = refershTokenValidation(req.body);
    if (error) {
      return customResponse(req, res, 400, { status: "error", message: error?.details[0]?.message }, true);
    }

    let tokenDetails = await verifyRefreshToken(req.body.refreshToken);
    if (!(tokenDetails && Object.keys(tokenDetails).length > 0)) {
      return customResponse(req, res, 400, { status: "error", message: "Invalid refresh token" }, true);
    }

    const payload = { _id: tokenDetails._id };
    const accessToken = JWT.sign(payload, process.env.ACCESS_TOKEN_PK, {
      expiresIn: "14m",
    });

    return customResponse(req, res, 200, {
      status: "success",
      accessToken,
      message: "Access token created successfully",
    }, true);

  } catch (e) {
    global.log.error(` Internal server Error Get Access token - ${JSON.stringify({e: e.stack})}`);
    return customResponse(req, res, 500, { status: "error", message: "Internal server error" }, true);
  }
};

export const getPublicKey = async (req, res, next) => {
  const public_key = fs.readFileSync(global.ROOT_DIR+'/config/keys/public_key.txt', "utf8");
  return customResponse(req, res, 200, {
    status: "success",
    public_key,
    message: "Fetched successfully",
  }, false);
}

