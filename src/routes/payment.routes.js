import express from 'express'
import { createPayment } from '../services/payment.service.js'

const router = express.Router()

router.post('/create-payment', async (req, res) => {
  try {
    const { amount, description, customer } = req.body

    const payment = await createPayment({
      amount,
      description,
      customer
    })

    return res.json({
      success: true,
      payment
    })
  } catch (err) {
  console.error('PAYSYNC ERROR FULL:', err)
  console.error('RESPONSE DATA:', err?.response?.data)
  console.error('MESSAGE:', err.message)

  return res.status(500).json({
    success: false,
    error: err?.response?.data || err.message
  })
}
})

export default router