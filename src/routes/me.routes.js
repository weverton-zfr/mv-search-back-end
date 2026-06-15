import express from 'express'
import { getMe } from '../controllers/me.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import axios from "axios";

const router = express.Router()

router.get('/me', authMiddleware, getMe)

export default router