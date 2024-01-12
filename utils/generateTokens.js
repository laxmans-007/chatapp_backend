import UserTokens from "../models/UserTokens.js";
import JWT from "jsonwebtoken";

export const generateTokens = async (user) => {
  try {
    const payload = { _id: user._id };
    const accessToken = JWT.sign(payload, process.env.ACCESS_TOKEN_PK, {
      expiresIn: "14m",
    });

    const refreshToken = JWT.sign(payload, process.env.REFRESH_TOKEN_PK, {
      expiresIn: "30d",
    });
    const userToken = await UserTokens.findOne({ userID: user._id });
    if (userToken) {
      await UserTokens.deleteMany({ userID: user._id });
    }

    await UserTokens.create({ userID: user._id, token: refreshToken });
    return Promise.resolve({ accessToken, refreshToken });
  } catch (e) {
    return Promise.reject(e);
  }
};

export const verifyRefreshToken = async (refreshToken) => {
  const privateKey = process.env.REFRESH_TOKEN_PK;
  let tokenDetails = {};
  let usertoken = await UserTokens.findOne({ token: refreshToken });
  if (!usertoken) {
    return tokenDetails;
  }
  return await JWT.verify(refreshToken, privateKey);
};
