import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';
import { WebSocketServer }  from 'ws';

import userRoute from './routes/userRoute.js';
import symptomRouter from './routes/symptomsRoute.js';
import predictRouter from './routes/predict.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', userRoute);
app.use('/api/symptoms', symptomRouter);
app.use('/api/predict', predictRouter);

// WebSocket logic
wss.on('connection', (ws) => {
    console.log('Client connected:', ws._socket.remoteAddress);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received from wearable:', data);

            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === 1) {
                    client.send(JSON.stringify(data));
                }
            });
        } catch (err) {
            console.error('WebSocket JSON parse error:', err);
        }
    });


    ws.on('close', () => {
        clearInterval(intervalId);
        console.log('Client disconnected');
    });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_DB).then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
        console.log(`Server (with WebSocket) running on port ${PORT}...`);
    });
}).catch((err) => {
    console.log('Error connecting to MongoDB:', err);
});
