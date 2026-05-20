import { supabase } from '../config/supabase.js'

export async function canUserSearch(userId) {
  const { count } = await supabase
    .from('search_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000))

  return count < 10
}

export async function saveSearch(userId, query) {
  return await supabase.from('search_logs').insert({
    user_id: userId,
    query
  })
}