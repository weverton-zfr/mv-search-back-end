import { supabase } from "../config/supabase.js";
import { ensureUserSubscriptionNotExpired } from "../services/subscription.service.js";

export async function getMe(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Usuário não autenticado"
      });
    }

    const userId = req.user.id;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    const subscription = await ensureUserSubscriptionNotExpired(userId);

    return res.json({
      profile: {
        ...profile,
        avatar_url: profile?.avatar_url || null
      },
      subscription
    });
  } catch (err) {
    console.error("GET /me ERROR:", err);

    return res.status(500).json({
      error: "Erro interno"
    });
  }
}
