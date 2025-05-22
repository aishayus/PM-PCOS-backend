import wearableModel from "../models/wearableModel.js";

// Store for tracking connection sessions
const connectionSessions = new Map();

//Connect with the wearable device
export const connectWearableDevice = async (req, res) => {
    try {
        const userId = req.userId;
        
        const connectionRecord = await wearableModel.findOneAndUpdate(
            { user: userId },
            {
                $set: {
                    connected: true,
                    lastConnected: new Date(),
                    sessionId: userId.toString(),
                    dataType: 'connection',
                    // Clear previous sensor data when reconnecting
                    pulse: null,
                    spo2: null,
                    ecg: null,
                    respiratoryRate: null,
                    gsr: null,
                    timestamp: new Date()
                }
            },
            { 
                upsert: true, // Create if doesn't exist
                new: true,    // Return the updated document
                runValidators: true
            }
        );

        // Store the active session
        connectionSessions.set(userId.toString(), {
            userId: userId,
            connected: true,
            timestamp: new Date()
        });

        console.log(`Connection established for user: ${userId}`);

        res.json({ 
            success: true, 
            message: 'Device connected successfully',
            sessionId: userId.toString()
        });

    } catch (error) {
        console.error('Error connecting wearable device:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to connect wearable device',
            error: error.message
        });
    }
};

//Check the connection status of the wearable device
export const checkWearableConnection = async (req, res) => {
    try {
        // Look for the user's record
        const status = await wearableModel.findOne({ 
            user: req.userId 
        });
        
        const isConnected = status?.connected || false;
        
        res.json({ 
            connected: isConnected,
            sessionId: status?.sessionId || null,
            lastConnected: status?.lastConnected || null
        });
    } catch (error) {
        console.error('Error checking status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check status',
            error: error.message
        });
    }
};

//Get all the data from the wearable device
export const getWearableData = async (req, res) => {
    try {
        // Get the user's wearable record
        const wearableData = await wearableModel.findOne({ 
            user: req.userId
        });
        
        // Return the data if it exists and has sensor readings
        if (wearableData && (wearableData.spo2 || wearableData.pulse || wearableData.respiratoryRate || wearableData.ecg || wearableData.gsr !== null)) {
            res.json({
                success: true,
                count: 1,
                data: [wearableData] // Return as array to match frontend expectation
            });
        } else {
            res.json({
                success: true,
                count: 0,
                data: []
            });
        }
    } catch (error) {
        console.error('Error fetching wearable data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch wearable data',
            error: error.message
        });
    }
};

// NEW ENDPOINT: Receive data from wearable device
export const receiveWearableData = async (req, res) => {
    try {
        const { spo2, pulse, respiratoryRate, ecg, gsr, deviceId } = req.body;
        
        console.log('Received wearable data:', { spo2, pulse, respiratoryRate, ecg, gsr, deviceId });
        
        // Find the most recent active connection session
        const recentConnection = await wearableModel.findOne({ 
            connected: true
        }).sort({ lastConnected: -1 });
        
        if (!recentConnection) {
            console.log('No active connection found');
            return res.status(404).json({
                success: false,
                message: 'No active connection found. Please connect from the web app first.'
            });
        }

        // Validate that we have at least some sensor data
        const hasValidData = spo2 || pulse || respiratoryRate || ecg || (gsr !== undefined && gsr !== null);
        
        if (!hasValidData) {
            console.log('No valid sensor data received');
            return res.status(400).json({
                success: false,
                message: 'No valid sensor data received'
            });
        }

        // Update the existing record with sensor data
        const updatedData = await wearableModel.findOneAndUpdate(
            { user: recentConnection.user },
            {
                $set: {
                    spo2: spo2 || recentConnection.spo2,
                    pulse: pulse || recentConnection.pulse,
                    respiratoryRate: respiratoryRate || recentConnection.respiratoryRate,
                    ecg: ecg || recentConnection.ecg,
                    gsr: gsr !== undefined ? gsr : recentConnection.gsr,
                    timestamp: new Date(),
                    connected: true,
                    deviceId: deviceId || 'PCOS_MONITOR_001',
                    dataType: 'sensor_data'
                }
            },
            { new: true }
        );

        console.log(`Sensor data updated for user ${recentConnection.user}:`, {
            spo2, pulse, respiratoryRate, ecg, gsr
        });

        res.json({
            success: true,
            message: 'Sensor data received and updated successfully',
            userId: recentConnection.user,
            dataId: updatedData._id
        });

    } catch (error) {
        console.error('Error receiving wearable data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to receive wearable data',
            error: error.message
        });
    }
};

export const cleanupSessions = () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    for (const [sessionId, session] of connectionSessions.entries()) {
        if (session.timestamp < oneHourAgo) {
            connectionSessions.delete(sessionId);
        }
    }
};