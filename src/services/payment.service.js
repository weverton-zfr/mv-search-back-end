import { paysync } from '../config/paysync.js'

export async function createPayment() {
  const response = await paysync.post('/v1/payments', {
    productId: process.env.PAYSYNC_PRODUCT_ID,
    callbackUrl: process.env.PAYSYNC_WEBHOOK_URL,
    customer: {
      name: 'Teste',
      email: 'teste@email.com'
    }
  })

  return response.data
}