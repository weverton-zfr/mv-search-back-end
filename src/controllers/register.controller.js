import { supabase } from '../config/supabase.js'

export async function register(req, res) {
  try {

    const {
      name,
      email,
      password,
      termsAccepted
    } = req.body

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({
        error: 'Preencha todos os campos.'
      })
    }

    if (!termsAccepted) {
      return res.status(400).json({
        error: 'Você precisa aceitar os Termos de Uso e Política de Privacidade.'
      })
    }

    const acceptedAt = new Date().toISOString()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,

          terms_accepted: true,
          terms_accepted_at: acceptedAt,
          terms_version: '1.0',

          privacy_accepted: true,
          privacy_accepted_at: acceptedAt,
          privacy_version: '1.0'
        }
      }
    })

    if (error) {
      return res.status(400).json({
        error: error.message
      })
    }

    const user = data.user

    if (!user) {
      return res.status(400).json({
        error: 'Não foi possível criar o usuário.'
      })
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name,
        email,

        terms_accepted: true,
        terms_accepted_at: acceptedAt,
        terms_version: '1.0',

        privacy_accepted: true,
        privacy_accepted_at: acceptedAt,
        privacy_version: '1.0'
      }, {
        onConflict: 'id'
      })

    if (profileError) {
      console.log(profileError)

      return res.status(400).json({
        error: profileError.message
      })
    }

    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan: 'Free',
        status: 'active'
      }, {
        onConflict: 'user_id'
      })

    if (subError) {
      console.log(subError)

      return res.status(400).json({
        error: subError.message
      })
    }

    return res.status(201).json({
      success: true,
      message: 'Conta criada com sucesso! Verifique seu email para confirmar o cadastro.'
    })

  } catch (err) {

    console.error(err)

    return res.status(500).json({
      error: 'Erro interno'
    })

  }
}