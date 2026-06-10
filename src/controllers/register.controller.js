import { supabase } from "../config/supabase.js";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function register(req, res) {
  try {
    const name = req.body.name?.toString().trim();
    const email = req.body.email?.toString().trim().toLowerCase();
    const password = req.body.password?.toString();
    const termsAccepted = req.body.termsAccepted;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Preencha todos os campos."
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

    if (password.length < 6) {
      return res.status(400).json({
        error: "A senha deve ter pelo menos 6 caracteres."
      });
    }

    if (!termsAccepted) {
      return res.status(400).json({
        error: "Você precisa aceitar os Termos de Uso e Política de Privacidade."
      });
    }

    const acceptedAt = new Date().toISOString();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,

          terms_accepted: true,
          terms_accepted_at: acceptedAt,
          terms_version: "1.0",

          privacy_accepted: true,
          privacy_accepted_at: acceptedAt,
          privacy_version: "1.0"
        }
      }
    });

    if (error) {
      return res.status(400).json({
        error: error.message || "Erro ao criar usuário."
      });
    }

    const user = data.user;

    if (!user) {
      return res.status(400).json({
        error: "Não foi possível criar o usuário."
      });
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          name,
          email,

          terms_accepted: true,
          terms_accepted_at: acceptedAt,
          terms_version: "1.0",

          privacy_accepted: true,
          privacy_accepted_at: acceptedAt,
          privacy_version: "1.0"
        },
        {
          onConflict: "id"
        }
      );

    if (profileError) {
      return res.status(400).json({
        error: profileError.message
      });
    }

    const { error: subError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: user.id,
          plan: "Plano Gratuito",
          status: "inactive",
          start_date: new Date().toISOString(),
          expires_at: null,
          payment_id: null
        },
        {
          onConflict: "user_id"
        }
      );

    if (subError) {
      return res.status(400).json({
        error: subError.message
      });
    }

    return res.status(201).json({
      success: true,
      message: "Conta criada com sucesso! Verifique seu email para confirmar o cadastro."
    });
  } catch {
    return res.status(500).json({
      error: "Erro interno"
    });
  }
}