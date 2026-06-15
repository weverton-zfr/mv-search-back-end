import { supabase } from "../config/supabase.js";
import { uploadAvatar } from "../services/avatar.service.js";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;

    const name = req.body.name?.toString().trim();
    const email = req.body.email?.toString().trim().toLowerCase();
    const avatarBase64 = req.body.avatarBase64;
    const avatarType = req.body.avatarType?.toString();

    if (!name || !email) {
      return res.status(400).json({
        error: "Nome e email são obrigatórios."
      });
    }

    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({
        error: "O nome deve ter entre 2 e 80 caracteres."
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Email inválido."
      });
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        email
      }
    );

    if (authError) {
      return res.status(400).json({
        error: authError.message
      });
    }

    let avatarUrl = null;

    if (avatarBase64) {
      avatarUrl = await uploadAvatar({
        userId,
        avatarBase64,
        avatarType
      });
    }

    const profileUpdate = {
      name,
      email
    };

    if (avatarUrl) {
      profileUpdate.avatar_url = avatarUrl;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Erro interno"
    });
  }
}

export async function updatePassword(req, res) {
  try {
    const userId = req.user.id;

    const currentPassword = req.body.currentPassword?.toString();
    const newPassword = req.body.newPassword?.toString();

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Senha atual e nova senha são obrigatórias."
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: "A nova senha deve ter pelo menos 8 caracteres."
      });
    }

    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(userId);

    if (userError || !userData?.user?.email) {
      return res.status(400).json({
        error: "Usuário não encontrado."
      });
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: userData.user.email,
      password: currentPassword
    });

    if (loginError) {
      return res.status(400).json({
        error: "Senha atual incorreta."
      });
    }

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    return res.json({
      success: true
    });
  } catch {
    return res.status(500).json({
      error: "Erro interno"
    });
  }
}