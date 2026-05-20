import { supabase } from '../config/supabase.js'

export async function getMe(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const userId = req.user.id

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    res.json({ profile, subscription })

  } catch (err) {
    console.error('GET /me ERROR:', err)
    res.status(500).json({ error: 'Erro interno' })
  }
}