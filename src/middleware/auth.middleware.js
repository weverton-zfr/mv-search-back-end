import { createClient } from '@supabase/supabase-js'
import { WebSocket } from 'ws'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    realtime: {
      transport: WebSocket
    }
  }
)

export async function authMiddleware(
  req,
  res,
  next
) {

  const token =
    req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      error: 'Sem token'
    })
  }

  const { data, error } =
    await supabase.auth.getUser(token)

  if (error || !data.user) {
    return res.status(401).json({
      error: 'Token inválido'
    })
  }

  req.user = data.user

  next()
}