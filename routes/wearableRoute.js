import express from 'express';
import { 
    connectWearableDevice, 
    checkWearableConnection, 
    getWearableData,
    receiveWearableData,
    checkConnectionRequest,
    confirmConnection
} from '../controllers/wearableController.js';
import authMiddleware from './../middlewares/auth.js';

const wearableRouter = express.Router();

wearableRouter.post('/connect', authMiddleware, connectWearableDevice);
wearableRouter.get('/status', authMiddleware, checkWearableConnection);
wearableRouter.get('/getdata', authMiddleware, getWearableData);

wearableRouter.get('/check-connection', checkConnectionRequest);
wearableRouter.post('/confirm-connection', confirmConnection);
wearableRouter.post('/wearabledata', receiveWearableData);

export default wearableRouter;