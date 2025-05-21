import wearableModel from "../models/wearableModel.js";

//Connect with the wearable device
export const connectWearableDevice = async (req, res) => {
    try {
        await wearableModel.findOneAndUpdate(
            { user: req.userId },
            { $set: { connected: true } },
            { upsert: true }
        );

        res.json({ 
            success: true, 
            message: 'Device connected' 
        })

        } catch (error) {
        console.error('Error connecting wearable device:', error);
        res.json({
            success: false,
            message: 'Failed to connect wearable device',
            error: error.message
        });
    }
};

//Check the connection status of the wearable device
export const checkWearableConnection = async (req, res) => {
    try {
        const status = await wearableModel.findOne({ user: req.userId });
        res.json({ connected: status?.connected || false });
    } catch (error) {
        console.error('Error checking status:', error);
            res.json({
                success: false,
                message: 'Failed to check status',
                error: error.message
            });
    }
};

//Get all the data from the wearable device
export const getWearableData = async (req, res) => {
    try {
        const wearableData = await wearableModel.find().sort({ timestamp: -1 }).limit(10)
        res.json({
            success: true,
            count: wearableData.length,
            wearableData
        });
    } catch (error) {
        console.error('Error fetching wearable data:', error);
        res.json({
            success: false,
            message: 'Failed to fetch wearable data',
            error: error.message
        });
    }
};
