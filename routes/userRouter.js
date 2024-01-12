import { Router } from "express";
import auth from "../middlewares/auth.js";
import { 
    getProfile,
    search
} from "../controllers/user.js";
import requestEncryption from "../middlewares/requestEncryption.js";

const router = Router();

router.route('/profile').get(requestEncryption, auth, getProfile);
router.route('/search').post(requestEncryption, auth, search);

export default router;
