import express from 'express'

import {
  createPayment,
  getPaymentStatus
} from '../services/payment.service.js'

const router = express.Router()

router.post('/create-payment', async (req, res) => {

  try {

    const { planID, customer } = req.body

    const payment = await createPayment({
      planID,
      customer
    })

    return res.json({
      success: true,
      payment
    })

  } catch (err) {

    console.error('CREATE PAYMENT ERROR:', err?.response?.data || err.message)

    return res.status(500).json({
      success: false,
      error: err?.response?.data || err.message
    })

  }

})

router.get('/payment-status/:id', async (req, res) => {

  try {

    const { id } = req.params

    const payment = await getPaymentStatus(id)

    return res.json({
      success: true,
      payment
    })

  } catch (err) {

    console.error('PAYMENT STATUS ERROR:', err?.response?.data || err.message)

    return res.status(500).json({
      success: false,
      error: err?.response?.data || err.message
    })

  }

})

export default router