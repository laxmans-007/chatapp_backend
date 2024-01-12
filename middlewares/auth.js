import jwt from "jsonwebtoken";
import customResponse from "../utils/customResponse.js";
import Users from "../models/Users.js";

const auth = async (req, res, next) => {
	let token = req.header("authorization");

	try {
		token = token.split(" ")[1] || '';
		if (!token)
			return customResponse(req, res, 403, { status: "error", message: "Access Denied: No token provided" }, true);

		const tokenDetails = jwt.verify(
			token,
			process.env.ACCESS_TOKEN_PK
		);
		
		req.user = tokenDetails;
		if(tokenDetails._id) {
			req.userDetails = await Users.findById(tokenDetails._id);
		}
		next();
	} catch (err) {
        global.log.error(` Internal server Error Auth middleware - ${JSON.stringify({e: err.stack})}`);
		return customResponse(req, res, 403, { status: "error", message: "Access Denied: Invalid token" }, true);
	}
};

export default auth;