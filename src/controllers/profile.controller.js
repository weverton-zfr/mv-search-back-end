import { supabase } from '../config/supabase.js'

export async function updateProfile(req, res) {
  try {

    const userId = req.user.id

    const {
      name,
      email
    } = req.body
    
    const { error: authError } =
      await supabase.auth.admin.updateUserById(
        userId,
        {
          email: email
        }
      )

    if (authError) {
      console.dir(authError, { depth: null })

      return res.status(400).json({
        error: authError.message
      })
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        name,
        email
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.log(error)

      return res.status(400).json({
        error: error.message
      })
    }

    return res.json(data)

  } catch (err) {

    console.log(err)

    return res.status(500).json({
      error: 'Erro interno'
    })

  }
}

export async function updatePassword(req, res) {

  try {

    const userId = req.user.id

    const {
      currentPassword,
      newPassword
    } = req.body

    const { data: userData } =
      await supabase.auth.admin.getUserById(userId)

    const user = userData.user

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      })

    if (loginError) {
      return res.status(400).json({
        error: 'Senha atual incorreta'
      })
    }

    const { error } =
      await supabase.auth.admin.updateUserById(
        userId,
        {
          password: newPassword
        }
      )

    if (error) {

      return res.status(400).json({
        error: error.message
      })

    }

    return res.json({
      success: true
    })

  } catch (err) {

    console.log(err)

    return res.status(500).json({
      error: 'Erro interno'
    })

  }

}