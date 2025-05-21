import mongoose from "mongoose";
const Schema = mongoose.Schema

const symptomsSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    age:{
        type:Number,
        required:true
    },
    weight:{
        type:Number,
        required:true
    },
    height:{
        type:Number,
        required:true
    },
    weightGain:{
        type:Boolean,
        required:true
    },
    hairGrowth:{
        type:Boolean,
        required:true
    },
    hairLoss:{
        type:Boolean,
        required:true
    },
    darkPatches:{
        type:Boolean,
        required:true
    },
    pimples:{
        type:Boolean,
        required:true
    },
    bloodGroup:{
        type:String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required:true
    },
    fastFoods:{
        type:Boolean,
        required:true
    },
    cycle:{
        type:String,
        enum: ['Regular (21-35 days)', 'Irregular (varies by more than 7 days)', 'Infrequent (more than 35 days)', 'Absent for more than 3 months'],
        required:true
    },
    cycleLength:{
        type:String,
        enum: ['Less than 3 days', '3-7 days', 'More than 7 days'],
        required:true
    },
    pregnancy:{
        type:Boolean,
        required:true
    },
    pcos:{
        type:Boolean,
        required:true
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    prediction: {
        label: {
            type: String,
            enum: ['Positive', 'Negative', null],
            default: null
        },
        confidence: {
            type: Object,
            default: null
        }
    },
})

const symptomsModel = mongoose.models.product || mongoose.model("symptoms", symptomsSchema)
export default symptomsModel