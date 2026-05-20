import { paysync } from '../config/paysync.js'

export async function createPayment({ planID, customer }) {

  const response = await paysync.post('/payments', {
    productId: planID,
    customer
  })

  return response.data
}

export async function getPaymentStatus(id) {

  const response = await paysync.get(`/payments/${id}`)

  return response.data
}