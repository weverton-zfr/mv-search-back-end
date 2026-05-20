import { supabase } from '../config/supabase.js'

export async function register(req, res) {
  try {

    const { name, email, password } = req.body

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      })

    if (error) {
      return res.status(400).json({
        error: error.message
      })
    }

    const user = data.user

    // cria subscription free
    const { error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan: 'free',
        status: 'active'
      })

    if (subError) {
      console.log(subError)

      return res.status(400).json({
        error: subError.message
      })
    }

    return res.json({
      success: true
    })

  } catch (err) {

    console.error(err)

    return res.status(500).json({
      error: 'Erro interno'
    })

  }
}