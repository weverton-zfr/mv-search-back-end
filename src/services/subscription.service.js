import { supabase } from "../config/supabase.js";
import { sendDiscordMessage } from "./discord.service.js";

const SUBSCRIPTION_TABLE = "subscriptions";

export async function activatePlan({ userId, plan, paymentId }) {

  const expiresAt = new Date();

  if (plan === "Plano Basic Mensal") {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  }

  if (plan === "Plano Basic Trimensal") {
    expiresAt.setMonth(expiresAt.getMonth() + 3);
  }

  if (plan === "Plano Anual") {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
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
      plan: "Free",
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
        plan: "Free",
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