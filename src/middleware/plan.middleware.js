import { supabase } from "../config/supabase.js";

export async function requireActivePlan(req, res, next) {
  try {
    const userId = req.user.id;

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("plan, status, expires_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;

    if (!subscription || subscription.plan === "Plano Gratuito") {
      return res.status(403).json({
        success: false,
        error: "Seu plano atual não permite realizar consultas."
      });
    }

    req.subscription = subscription;

    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Erro ao validar assinatura."
    });
  }
}