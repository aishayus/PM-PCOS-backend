import express from 'express'
import axios from 'axios'
import symptomsModel from './../models/symptomsModel.js';
import authMiddleware from '../middlewares/auth.js';
import wearableModel from '../models/wearableModel.js';

const route = express.Router()

function averageCycleLength(cycleString) {
    const cleanedString = cycleString.replace(/[^0-9\-]/g, '');
    
    if (cleanedString.includes('-')) {
        const [min, max] = cleanedString.split('-').map(num => parseInt(num, 10));
        return (min + max) / 2;
    }
    
    return parseInt(cleanedString, 10);
}

route.get('/result', authMiddleware, async (req, res) => {
    try{
        const symptoms = await symptomsModel.findOne({ user: req.userId }).sort({ date: -1 }).lean()
        const wearable = await wearableModel.findOne({ user: req.userId }).sort({ date: -1 }).lean()
        
        if(!symptoms)
            return res.json({
                success: false,
                message: 'No Symptoms Inputted'
        })

        if(!wearable)
            return res.json({
                success: false,
                message: 'No Wearable Data found'
        })

        const payload = {
            'Age (yrs)': symptoms.age,
            'Weight (Kg)': symptoms.weight,
            'Height(Cm)': symptoms.height,
            'PulseA rate(bpm)': wearable?.pulse || 75,
            'RR (breaths/min)': wearable?.respiratoryRate || 13,
            'Weight gain(Y/N)': symptoms.weightGain ? 1 : 0,
            'hair growth(Y/N)': symptoms.hairGrowth ? 1 : 0,
            'Skin darkening (Y/N)': symptoms.darkPatches ? 1 : 0,
            'Hair loss(Y/N)': symptoms.hairLoss ? 1 : 0,
            'Pimples(Y/N)': symptoms.pimples ? 1 : 0,
            'Fast food (Y/N)': symptoms.fastFoods ? 1 : 0,
            'Cycle length(days)': averageCycleLength(info.cycleLength),
            'Pregnant(Y/N)': symptoms.pregnancy ? 1 : 0,
        }

        const flaskRes = await axios.post('http://52.201.254.142:8000/predict', 
            payload, {
                headers: {'Content-Type': 'application/json'}
            })

        await symptomsModel.findByIdAndUpdate(symptoms._id, {
            prediction: {
                label: flaskRes.data.prediction === 1 ? 'Positive' : 'Negative',
                confidence: flaskRes.data.confidence
            }
        })

        return res.json(flaskRes.data)
    } catch(error) {
        console.log(error)
        return res.json({
            success: false,
            message: 'Prediction failed',
        })
    }
})

export default route