import mongoose from "mongoose";
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
        required: true
    }
}, {timestamps: true})

const userModel = mongoose.model('users', userSchema)
export default userModel