import { Router } from "express";
import { 
    signUp,
    signIn,
    signOut,
    getPublicKey,
    verifyRefreshTokenAndGetAccessToken
} from "../controllers/auth.js";
import multerConfig from "../config/multerConfig.js";
import requestEncryption from "../middlewares/requestEncryption.js";
const signUpMulterInstance = multerConfig('uploads/dp/');

const router = Router();

router.route('/signUp').post(signUpMulterInstance.single('dp'), requestEncryption, signUp);
router.route('/signIn').post(requestEncryption, signIn);
router.route('/refreshToken').post(requestEncryption, verifyRefreshTokenAndGetAccessToken).delete(signOut);
router.route('/getPublicKey').get(getPublicKey);


export default router;