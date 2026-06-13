import { paysync } from "../config/paysync.js";
import { supabase } from "../config/supabase.js";
import { checkAndActivate } from "../services/payment.service.js";
import { plans } from "../config/plans.config.js";
import { createPaySyncCardPayment } from "../services/paysync.service.js";
import { activatePlan } from "../services/subscription.service.js";

async function getAuthenticatedCustomer(userId) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    throw new Error("Perfil do usuário não encontrado.");
  }

  if (!profile.name || !profile.email) {
    throw new Error("Nome e email do usuário são obrigatórios.");
  }

  return {
    name: profile.name,
    email: profile.email
  };
}

function getSelectedPlan(planID) {
  if (!planID) {
    throw new Error("ID do plano é obrigatório.");
  }

  const selectedPlan = plans[planID];

  if (!selectedPlan) {
    throw new Error("Plano não encontrado.");
  }

  return selectedPlan;
}

export async function createPayment(req, res) {
  try {
    const { planID } = req.body;
    const userId = req.user?.id;

    console.log("CREATE PIX BODY:", req.body);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Usuário não autenticado."
      });
    }

    const selectedPlan = getSelectedPlan(planID);
    const customer = await getAuthenticatedCustomer(userId);

    const response = await paysync.post("/payments", {
      productId: planID,
      customer: {
        name: customer.name,
        email: customer.email
      }
    });

    return res.json({
      ...response.data,
      productName: selectedPlan.name,
      amountCents: selectedPlan.valueCents
    });
  } catch (err) {
    console.error("CREATE PAYMENT ERROR:", {
      message: err.message,
      status: err?.response?.status,
      data: err?.response?.data
    });

    return res.status(err?.response?.status || 500).json({
      success: false,
      error:
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err.message
    });
  }
}

export async function getPaymentStatus(req, res) {
  try {
    const { id } = req.params;

    const response = await paysync.get(`/payments/${id}`);

    return res.json(response.data);
  } catch (err) {
    console.error("PAYMENT STATUS ERROR:", {
      message: err.message,
      status: err?.response?.status,
      data: err?.response?.data
    });

    return res.status(err?.response?.status || 500).json({
      success: false,
      error:
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err.message
    });
  }
}

export async function getCheckAndActivate(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Usuário não autenticado."
      });
    }

    const result = await checkAndActivate({
      paymentId: id,
      userId
    });

    return res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error("CHECK AND ACTIVATE ERROR:", err);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

export async function createCardPayment(req, res) {
  try {
    const { planID } = req.body;
    const userId = req.user?.id;

    console.log("CREATE CARD BODY:", req.body);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Usuário não autenticado."
      });
    }

    const selectedPlan = getSelectedPlan(planID);
    const customer = await getAuthenticatedCustomer(userId);

    const payment = await createPaySyncCardPayment({
      valueCents: selectedPlan.valueCents,
      description: selectedPlan.name,

      callbackUrl: `${process.env.BACKEND_URL}/payments/card-webhook`,

      customer: {
        name: customer.name,
        email: customer.email,
        externalId: userId
      },

      metadata: JSON.stringify({
        userId,
        planID,
        plan: selectedPlan.name,
        customerEmail: customer.email
      }),

      successUrl: `${process.env.FRONTEND_URL}/`,
      cancelUrl: `${process.env.FRONTEND_URL}/plans`
    });

    return res.status(201).json({
      ...payment,
      productName: selectedPlan.name,
      amountCents: selectedPlan.valueCents
    });
  } catch (err) {
    console.error("CREATE CARD ERROR:", {
      message: err.message,
      status: err?.response?.status,
      data: err?.response?.data
    });

    return res.status(err?.response?.status || 500).json({
      success: false,
      error:
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err.message
    });
  }
}

export async function cardWebhook(req, res) {
  try {
    const payload = req.body;

    const status = payload.status || payload.paymentStatus;

    if (status !== "paid") {
      return res.status(200).json({
        success: true
      });
    }

    const metadata =
      typeof payload.metadata === "string"
        ? JSON.parse(payload.metadata)
        : payload.metadata;

    if (!metadata?.userId) {
      return res.status(400).json({
        success: false,
        error: "Metadata inválido."
      });
    }

    await activatePlan({
      userId: metadata.userId,
      plan: metadata.plan,
      paymentId: payload.id || payload.paymentId
    });

    return res.status(200).json({
      success: true
    });
  } catch (err) {
    console.error("CARD WEBHOOK ERROR:", err);

    return res.status(500).json({
      success: false
    });
  }
}