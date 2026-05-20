import express from 'express'
import { search } from '../controllers/search.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/search', authMiddleware, search)

export default router