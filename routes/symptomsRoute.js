import express from 'express'
import { createSymptomsController, getSymptomsController } from '../controllers/symptomsController.js'
import authMiddleware from '../middlewares/auth.js'

const route = express.Router()

route.post('/create', authMiddleware, createSymptomsController)
route.get('/result', authMiddleware, getSymptomsController)

export default route