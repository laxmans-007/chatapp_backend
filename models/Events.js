import mongoose, {Schema} from "mongoose";

const eventSchema = new mongoose.Schema({
    toUser: {
        type: Schema.Types.ObjectId,
        required: true
    },
    event: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["message", "voice_call", "video_call"],
        default: "message"
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 30 * 86400 // 30 days
    }
});

export default mongoose.models.Events || mongoose.model("Events", eventSchema);