import express from 'express';
import authMiddleware from '../middlewares/auth.js';
import { checkWearableConnection, connectWearableDevice, getWearableData } from '../controllers/wearableController.js';

const route = express.Router()

route.get('/getdata', authMiddleware, getWearableData)
route.post('/connect', authMiddleware, connectWearableDevice)
route.get('/status', authMiddleware, checkWearableConnection);

export default route