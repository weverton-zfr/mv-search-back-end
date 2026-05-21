import { paysync } from '../config/paysync.js'
import { checkAndActivate } from '../services/payment.service.js'

export async function createPayment(req, res){

  try {

    const { planID, customer } = req.body

    const response = await paysync.post('/payments', {
    productId: planID,
    customer
  })

    return res.json(response.data)

  } catch (err) {

    console.error('CREATE PAYMENT ERROR:', err?.response?.data || err.message)

    return res.status(500).json({
      success: false,
      error: err?.response?.data || err.message
    })

  }

}

export async function getPaymentStatus(req, res){

  try {

    const { id } = req.params

    
    const response = await paysync.get(`/payments/${id}`)

    return res.json(response.data)

  } catch (err) {

    console.error('PAYMENT STATUS ERROR:', err?.response?.data || err.message)

    return res.status(500).json({
      success: false,
      error: err?.response?.data || err.message
    })

  }

}

export async function getCheckAndActivate(req, res) {
  try {

    const { id } = req.params
    const userId = req.user.id
    const plan = req.body.plan

    const result = await checkAndActivate({
      paymentId: id,
      userId,
      plan
    })

    return res.json({
      success: true,
      ...result
    })

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    })
  }
}