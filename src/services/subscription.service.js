import { supabase } from '../config/supabase.js'

export async function activatePlan({
  userId,
  plan,
  paymentId
}) {
  const expiresAt = new Date()
  if (plan === 'Plano Basic Mensal') {
  expiresAt.setMonth(expiresAt.getMonth() + 1)
  }

  if (plan === 'Plano Basic Trimensal') {
    expiresAt.setMonth(expiresAt.getMonth() + 3)
  }

  if (plan === 'Plano Anual') { 
    expiresAt.setMonth(expiresAt.getMonth() + 12)
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      user_id: userId,
      plan,
      payment_id: paymentId,
      status: 'active',
      start_date: new Date(),
      expires_at: expiresAt
    }).eq('user_id', userId)

  if (error) throw error

  return data
}