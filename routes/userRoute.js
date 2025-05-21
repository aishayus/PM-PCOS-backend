import express from 'express'
import { registerController, updateController, loginController, removeController, getUserController, googleLoginController } from '../controllers/userController.js'
import authMiddleware from '../middlewares/auth.js'

const route = express.Router()

route.post('/register', registerController)
route.post('/google-login', googleLoginController)
route.post('/login', loginController)
route.get('/get', authMiddleware, getUserController)
route.put('/update', authMiddleware, updateController)
route.delete('/remove', authMiddleware, removeController)

export default route