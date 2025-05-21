import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose'
import userRoute from './routes/userRoute.js'
import symptomRouter from './routes/symptomsRoute.js'
import predictRouter from './routes/predict.js'
import wearableRouter from './routes/wearableRoute.js';

const app = express()
dotenv.config()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true}))

app.use('/api', userRoute)
app.use('/api/symptoms', symptomRouter)
app.use('/api/predict', predictRouter)
app.use('/api/wearable', wearableRouter);

mongoose.connect(process.env.MONGO_DB).then(() => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}....`)
    })
    }).catch((err) => {
        console.log('Error connecting to MongoDB:', err)
})