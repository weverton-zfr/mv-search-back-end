import { supabase } from "../config/supabase.js";
import { sendDiscordMessage } from "./discord.service.js";

const SUBSCRIPTION_TABLE = "subscriptions";

const PLAN_DURATIONS = {
  "Plano Básico de Verificação": {
    months: 1
  },
  "Plano Avançado de Verificação": {
    months: 3
  },
  "Plano Profissional de Verificação": {
    months: 6
  }
};

export async function activatePlan({ userId, plan, paymentId }) {
  const expiresAt = new Date();

  const selectedPlan = PLAN_DURATIONS[plan];

  if (!selectedPlan) {
    throw new Error(`Plano inválido: ${plan}`);
  }

  if (selectedPlan.months) {
    expiresAt.setMonth(expiresAt.getMonth() + selectedPlan.months);
  }

  const payload = {
    user_id: userId,
    plan,
    payment_id: paymentId,
    status: "active",
    start_date: new Date().toISOString(),
    expires_at: expiresAt.toISOString()
  };

  const { data, error } = await supabase
    .from(SUBSCRIPTION_TABLE)
    .upsert(payload, {
      onConflict: "user_id"
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function expireSubscriptions() {
  const now = new Date().toISOString();

  const { data: expiredSubscriptions, error: selectError } = await supabase
    .from(SUBSCRIPTION_TABLE)
    .select("*")
    .lt("expires_at", now)
    .eq("status", "active");

  if (selectError) throw selectError;

  if (!expiredSubscriptions?.length) {
    return [];
  }

  for (const subscription of expiredSubscriptions) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", subscription.user_id)
      .maybeSingle();

    const message = `
🚨 **Plano expirado**

👤 **Nome:** ${profile?.name || "Não informado"}
📧 **Email:** ${profile?.email || "Não informado"}
📦 **Plano:** ${subscription.plan}
📅 **Vencimento:** ${new Date(subscription.expires_at).toLocaleString("pt-BR")}
🆔 **Usuário:** ${subscription.user_id}
`;

    await sendDiscordMessage(message);
  }

  const { data, error } = await supabase
    .from(SUBSCRIPTION_TABLE)
    .update({
      plan: "Plano Gratuito",
      status: "inactive",
      expires_at: null,
      payment_id: null
    })
    .lt("expires_at", now)
    .eq("status", "active")
    .select();

  if (error) throw error;

  return data;
}

export async function ensureUserSubscriptionNotExpired(userId) {
  const now = new Date().toISOString();

  const { data: subscription, error } = await supabase
    .from(SUBSCRIPTION_TABLE)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  if (
    subscription?.status === "active" &&
    subscription?.expires_at &&
    subscription.expires_at < now
  ) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", userId)
      .maybeSingle();

    const message = `
🚨 **Plano expirado automaticamente**

👤 **Nome:** ${profile?.name || "Não informado"}
📧 **Email:** ${profile?.email || "Não informado"}
📦 **Plano:** ${subscription.plan}
📅 **Vencimento:** ${new Date(subscription.expires_at).toLocaleString("pt-BR")}
🆔 **Usuário:** ${subscription.user_id}
`;

    await sendDiscordMessage(message);

    const { data, error: updateError } = await supabase
      .from(SUBSCRIPTION_TABLE)
      .update({
        plan: "Plano Gratuito",
        status: "inactive",
        expires_at: null,
        payment_id: null
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) throw updateError;

    return data;
  }

  return subscription;
}