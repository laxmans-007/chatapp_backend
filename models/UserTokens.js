import mongoose, { Schema } from "mongoose";


const tokenSchema = new mongoose.Schema({
    userID: {
        type: Schema.Types.ObjectId,
        required: true
    },
    token: {
        type:String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 30 * 86400 // 30 days
    }
});

export default  mongoose.models.UserTokens || mongoose.model("UserTokens", tokenSchema);