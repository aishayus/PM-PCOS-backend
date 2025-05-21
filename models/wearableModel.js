import mongoose, { mongo } from 'mongoose';
const Schema = mongoose.Schema

const wearableSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    pulse:{
        type:Number,
        required:true
    },
    spo2:{
        type:Number,
        required:true
    },
    ecg:{
        type:Number,
        required:true
    },
    respiratoryRate:{
        type:Number,
        required:true
    },
    gsr:{
        type:Number,
        required:true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    connected: {
        type: Boolean,
        default: false
    }
})

const wearableModel = mongoose.model('wearableData', wearableSchema)
export default wearableModel