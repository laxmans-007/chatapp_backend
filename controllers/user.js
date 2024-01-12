
import Users from "../models/Users.js";
import customResponse from "../utils/customResponse.js";
import { searchValidation } from "../utils/validationSchema.js";

export const getProfile = async (req, res, next) => {
    try {
      let user = await Users.findById(req.user._id, {password: 0, _id: 0});
      if(!user) {
        return customResponse(req, res, 403,{ status: "error", message: "Unauthorized." }, true);
      }
      if(user.dp) {
        user.dp = req.BASE_URL+"/uploads/dp/"+user.dp;
      }
      return customResponse(req, res, 200,{ status: "success", data: user, message: "Fetched successfully" }, true);
    } catch (e) { 
      global.log.error(` Internal server Error getProfile - ${JSON.stringify({e: e.stack})}`);
      return customResponse(req, res, 500, { status: "error", message: "Internal server error" }, true);
    }
  };

  export const search = async (req, res, next) => {
    try {
      const { error } = searchValidation(req.body);
      console.log("eq.body - ", req.body);
      if (error) {
        return customResponse(req, res, 400, { status: "error", message: error?.details[0]?.message }, true);
      }
      let user = await Users.findOne( {$or: [{ mobile: req.body.mobile}, { email: req.body.email }]}
        , {password: 0, _id: 0, __v: 0});

      if(!user) {
        return customResponse(req, res, 404,{ status: "error", message: "User not found" }, true);
      }
      if(user.dp) {
        user.dp = req.BASE_URL+"/uploads/dp/"+user.dp;
      }
      return customResponse(req, res, 200,{ status: "success", data: user, message: "Fetched successfully" }, true);
    } catch (e) {
      global.log.error(` Internal server Error Search - ${JSON.stringify({e: e.stack})}`);
      return customResponse(req, res, 500, { status: "error", message: "Internal server error" }, true);
    }
  };


