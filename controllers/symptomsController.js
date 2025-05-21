import symptomsModel from "../models/symptomsModel.js";

export const createSymptomsController = async (req, res) => {
    try {
        const symptomsData = {
            user: req.userId,
            age: req.body.age,
            weight: req.body.weight,
            height: req.body.height,
            weightGain: req.body.weightGain,
            hairGrowth: req.body.hairGrowth,
            hairLoss: req.body.hairLoss,
            darkPatches: req.body.darkPatches,
            pimples: req.body.pimples,
            bloodGroup: req.body.bloodGroup,
            fastFoods: req.body.fastFoods,
            cycle: req.body.cycle,
            cycleLength: req.body.cycleLength,
            pregnancy: req.body.pregnancy,
            pcos: req.body.pcos,
            date: new Date()
        };

        const newEntry = new symptomsModel(symptomsData);
        await newEntry.save();
    
        res.json({
            success: true,
            message: "Symptoms submitted successfully",
            data: newEntry,
        });
    } catch (error) {
        console.error("Error in createSymptomsController:", error)
        res.json({
            success: false,
            message: "Error submitting symptoms",
            error: error.message,
        });
    }
};

export const getSymptomsController = async (req, res) => {
    try {
        const entries = await symptomsModel
            .find({ user: req.userId })
            .sort({ date: -1 });

        if (entries.length === 0) {
            return res.json({
                success: false,
                message: "No symptom entries found for this user",
                data: [],
            });
        }

        res.json({
            success: true,
            message: "Fetched symptom history",
            data: entries,
        })
    } catch (error) {
        console.error("Error in getSymptomsController:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving symptoms",
            error: error.message,
        });
    }
};
