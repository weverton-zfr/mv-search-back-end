import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { updatePassword, updateProfile } from '../controllers/profile.controller.js'

const router = express.Router()

router.put(
  '/profile',
  authMiddleware,
  updateProfile
)

router.put(
  '/profile/password',
  authMiddleware,
  updatePassword
)

export default router