import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const wearableSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        unique: true  // Explicitly set unique constraint
    },
    pulse: {
        type: Number,
        required: false,
        default: null
    },
    spo2: {
        type: Number,
        required: false,
        default: null
    },
    ecg: {
        type: Number,
        required: false,
        default: null
    },
    respiratoryRate: {
        type: Number,
        required: false,
        default: null
    },
    gsr: {
        type: Number,
        required: false,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    connected: {
        type: Boolean,
        default: false
    },
    // Additional fields for better tracking
    deviceId: {
        type: String,
        required: false,
        default: 'unknown'
    },
    sessionId: {
        type: String,
        required: false
    },
    lastConnected: {
        type: Date,
        default: Date.now
    },
    dataType: {
        type: String,
        enum: ['connection', 'sensor_data'],
        default: 'connection'
    }
});

const wearableModel = mongoose.model('wearableData', wearableSchema);

export default wearableModel;