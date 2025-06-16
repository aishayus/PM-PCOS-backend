import wearableModel from "../models/wearableModel.js";

// Store for tracking connection sessions
const connectionSessions = new Map();

//Connect with the wearable device
export const connectWearableDevice = async (req, res) => {
    try {
        const userId = req.userId;
        
        console.log(`Connection request initiated for user: ${userId}`);
        
        const connectionRecord = await wearableModel.findOneAndUpdate(
            { user: userId },
            {
                $set: {
                    connected: false, // Initially false until device confirms
                    connectionRequested: true, // Flag for device to check
                    lastConnected: new Date(),
                    sessionId: userId.toString(),
                    dataType: 'connection_request',
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
            connectionRequested: true,
            connected: false,
            timestamp: new Date()
        });

        console.log(`✓ Connection request stored for user: ${userId}`);

        res.json({ 
            success: true, 
            message: 'Connection request sent to device. Please start your wearable device now.',
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

// Check if device should connect (polled by MicroPython)
export const checkConnectionRequest = async (req, res) => {
    try {
        // Find any user with a pending connection request
        const pendingConnection = await wearableModel.findOne({
            connectionRequested: true,
            connected: false
        }).sort({ lastConnected: -1 });

        if (pendingConnection) {
            console.log(`✓ Device polling: Connection request found for user ${pendingConnection.user}`);
            res.json({
                shouldConnect: true,
                userId: pendingConnection.user,
                sessionId: pendingConnection.sessionId
            });
        } else {
            res.json({
                shouldConnect: false
            });
        }
    } catch (error) {
        console.error('Error checking connection request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check connection request',
            error: error.message
        });
    }
};

// Confirm connection from device
export const confirmConnection = async (req, res) => {
    try {
        const { deviceId, status } = req.body;
        
        console.log('✓ Device confirming connection:', { deviceId, status });
        
        // Update the most recent connection request
        const updatedConnection = await wearableModel.findOneAndUpdate(
            { 
                connectionRequested: true,
                connected: false 
            },
            {
                $set: {
                    connected: true,
                    connectionRequested: false,
                    deviceId: deviceId || 'PCOS_MONITOR_001',
                    connectionConfirmed: new Date(),
                    dataType: 'connection_confirmed'
                }
            },
            { 
                new: true,
                sort: { lastConnected: -1 } // Get the most recent
            }
        );

        if (updatedConnection) {
            // Update session store
            const sessionId = updatedConnection.sessionId;
            if (connectionSessions.has(sessionId)) {
                connectionSessions.set(sessionId, {
                    ...connectionSessions.get(sessionId),
                    connected: true,
                    confirmedAt: new Date()
                });
            }

            console.log(`✓ Connection confirmed for user: ${updatedConnection.user}`);
            
            res.json({
                success: true,
                message: 'Connection confirmed successfully',
                userId: updatedConnection.user
            });
        } else {
            console.log('✗ No pending connection request found');
            res.status(404).json({
                success: false,
                message: 'No pending connection request found'
            });
        }
    } catch (error) {
        console.error('Error confirming connection:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to confirm connection',
            error: error.message
        });
    }
};

//Check the connection status of the wearable device
export const checkWearableConnection = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Look for the user's record
        const status = await wearableModel.findOne({ 
            user: userId 
        });
        
        const isConnected = status?.connected || false;
        const isRequested = status?.connectionRequested || false;
        
        console.log(`Status check for user ${userId}: connected=${isConnected}, requested=${isRequested} `);
        
        res.json({ 
            connected: isConnected,
            connectionRequested: isRequested,
            sessionId: status?.sessionId || null,
            lastConnected: status?.lastConnected || null,
            connectionConfirmed: status?.connectionConfirmed || null,
            deviceId: status?.deviceId || null
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
        const userId = req.userId;
        
        // Get the user's wearable record
        const wearableData = await wearableModel.findOne({ 
            user: userId
        });
        
        console.log(`Data request for user ${userId}: `, wearableData ? 'Found record' : 'No record');
        
        // Return the data if it exists and has sensor readings
        if (wearableData && (wearableData.spo2 || wearableData.pulse || wearableData.respiratoryRate || wearableData.ecg || wearableData.gsr !== null)) {
            console.log(`✓ Returning sensor data for user ${userId}: `, {
                spo2: wearableData.spo2,
                pulse: wearableData.pulse,
                respiratoryRate: wearableData.respiratoryRate,
                ecg: wearableData.ecg,
                gsr: wearableData.gsr
            });
            
            res.json({
                success: true,
                count: 1,
                data: [wearableData] // Return as array to match frontend expectation
            });
        } else {
            res.json({
                success: true,
                count: 0,
                data: [],
                message: 'No sensor data available yet'
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

// Receive data from wearable device
export const receiveWearableData = async (req, res) => {
    try {
        const { spo2, pulse, respiratoryRate, ecg, gsr, deviceId } = req.body;
        
        console.log('✓ Received wearable data from device:', { spo2, pulse, respiratoryRate, ecg, gsr, deviceId });
        
        // Find the most recent active connection session
        const recentConnection = await wearableModel.findOne({ 
            connected: true
        }).sort({ connectionConfirmed: -1 });
        
        if (!recentConnection) {
            console.log('✗ No active connection found');
            return res.status(404).json({
                success: false,
                message: 'No active connection found. Please connect from the web app first.'
            });
        }

        // Validate that we have at least some sensor data
        const hasValidData = spo2 || pulse || respiratoryRate || ecg || (gsr !== undefined && gsr !== null);
        
        if (!hasValidData) {
            console.log('✗ No valid sensor data received');
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
                    dataType: 'sensor_data',
                    lastDataReceived: new Date()
                }
            },
            { new: true }
        );

        console.log(`✓ Sensor data updated for user ${recentConnection.user}: ` , {
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
            console.log(`Cleaned up expired session: ${sessionId}`);
        }
    }
};