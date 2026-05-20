import { canUserSearch, saveSearch } from '../services/search.service.js'

export async function search(req, res) {
  const userId = req.user.id
  const { query } = req.body

  const allowed = await canUserSearch(userId)

  if (!allowed) {
    return res.status(403).json({
      error: 'Limite de pesquisas atingido'
    })
  }

  await saveSearch(userId, query)

  // aqui entra sua lógica de busca real
  return res.json({
    result: `Resultado para: ${query}`
  })
}