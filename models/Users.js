import mongoose from "mongoose";
import validator from "validator";
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        maxLength: [30, "Name cannot exceeds 30 characters."],
        minLength: [4, "Name should have 4 characters long."]
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email."]
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
        minLength: [10, "Mobile number should be 10 digits"],
        maxLength: [15, "Mobile number cannot be more than 15 digits."]
    },
    dp: {
        type: String,
        default: ''
    },
    text_status: {
        type: String,
        default: 'Hi There!'
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minLength: [8, "Password should be greater than 8 characters."],
        // select: false
    },
    status: {
        type: String,
        enum: ["online", "away"],
        default: "away"
    },
    socketID: {
        type: String,
        default: ''
    },
    encryption: {
        type: Object,
        default: {}
    }
});

userSchema.pre("save", async function (next) {
    if(!this.isModified()) {
        next();
    }
    const salt = await bcrypt.genSalt(process.env.SALT);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(userPassword) {
    return await bcrypt.compare(userPassword|| '', this.password);
}

const Users = mongoose.models.Users || mongoose.model("Users", userSchema);
export default Users;