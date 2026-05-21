import { paysync } from '../config/paysync.js'
import { activatePlan } from './subscription.service.js'

export async function checkAndActivate({ paymentId, userId, plan }) {
  const response = await paysync.get(`/payments/${paymentId}`)

  const payment = response.data
  console.log(response.data)

  if (payment.status === 'paid') {

    await activatePlan({ userId, plan, paymentId })

    return {
      paid: true,
      payment
    }
  }

  return {
    paid: false,
    payment
  }
}