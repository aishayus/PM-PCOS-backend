import express from 'express';
import { 
    connectWearableDevice, 
    checkWearableConnection, 
    getWearableData,
    receiveWearableData  
} from '../controllers/wearableController.js';
import authMiddleware from './../middlewares/auth.js';

const wearableRouter = express.Router();
wearableRouter.post('/connect', authMiddleware, connectWearableDevice);
wearableRouter.get('/status', authMiddleware, checkWearableConnection);
wearableRouter.get('/getdata', authMiddleware, getWearableData);

wearableRouter.post('/wearabledata', receiveWearableData);

export default wearableRouter;