import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { register } from '../controllers/register.controller.js'

const router = express.Router()

router.post('/register', authMiddleware, register)

export default router