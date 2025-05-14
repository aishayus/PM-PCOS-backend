import express from 'express'
import axios from 'axios'
import symptomsModel from './../models/symptomsModel.js';
import authMiddleware from '../middlewares/auth.js';

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
        const info = await symptomsModel.findOne({ user: req.userId }).sort({ date: -1 }).lean()
        if(!info)
            return res.json({
                success: false,
                message: 'No Symptoms Inputted'
            })

        const payload = {
            'Age (yrs)': info.age,
            'Weight (Kg)': info.weight,
            'Height(Cm)': info.height,
            'PulseA rate(bpm)': info.pulse || 75,
            'RR (breaths/min)': info.respiratoryRate || 13,
            'Weight gain(Y/N)': info.weightGain ? 1 : 0,
            'hair growth(Y/N)': info.hairGrowth ? 1 : 0,
            'Skin darkening (Y/N)': info.darkPatches ? 1 : 0,
            'Hair loss(Y/N)': info.hairLoss ? 1 : 0,
            'Pimples(Y/N)': info.pimples ? 1 : 0,
            'Fast food (Y/N)': info.fastFoods ? 1 : 0,
            'Cycle length(days)': averageCycleLength(info.cycleLength),
            'Pregnant(Y/N)': info.pregnancy ? 1 : 0,
        }

        const flaskRes = await axios.post('http://52.201.254.142:8000/predict', 
            payload, {
                headers: {'Content-Type': 'application/json'}
            })

        await symptomsModel.findByIdAndUpdate(info._id, {
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