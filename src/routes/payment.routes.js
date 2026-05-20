import express from 'express'
import { createPayment, getPaymentStatus } from '../controllers/payment.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/create-payment', authMiddleware, createPayment)

router.get('/payment-status/:id', authMiddleware, getPaymentStatus)

export default router