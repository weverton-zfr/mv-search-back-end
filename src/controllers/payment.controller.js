import { paysync } from "../config/paysync.js";
import { checkAndActivate } from "../services/payment.service.js";
import { plans } from "../config/plans.config.js";
import { createPaySyncCardPayment } from "../services/paysync.service.js";

export async function createPayment(req, res) {
  try {
    const { planID, customer } = req.body;

    const response = await paysync.post("/payments", {
      productId: planID,
      customer
    });

    return res.json(response.data);
  } catch (err) {
    console.error("CREATE PAYMENT ERROR:", err?.response?.data || err.message);

    return res.status(500).json({
      success: false,
      error: err?.response?.data || err.message
    });
  }
}

export async function getPaymentStatus(req, res) {
  try {
    const { id } = req.params;

    const response = await paysync.get(`/payments/${id}`);

    return res.json(response.data);
  } catch (err) {
    console.error("PAYMENT STATUS ERROR:", err?.response?.data || err.message);

    return res.status(500).json({
      success: false,
      error: err?.response?.data || err.message
    });
  }
}

export async function getCheckAndActivate(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const plan = req.body.plan;

    const result = await checkAndActivate({
      paymentId: id,
      userId,
      plan
    });

    return res.json({
      success: true,
      ...result
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

export async function createCardPayment(req, res) {
  try {
    const { planID, customer } = req.body;
    const userId = req.user.id;

    if (!planID) {
      return res.status(400).json({
        success: false,
        error: "ID do plano é obrigatório"
      });
    }

    if (!customer?.name || !customer?.email) {
      return res.status(400).json({
        success: false,
        error: "Nome e email do cliente são obrigatórios"
      });
    }

    const selectedPlan = plans[planID];

    if (!selectedPlan) {
      return res.status(404).json({
        success: false,
        error: "Plano não encontrado"
      });
    }

    const payment = await createPaySyncCardPayment({
      valueCents: selectedPlan.valueCents,
      description: selectedPlan.name,

      callbackUrl: `${process.env.BACKEND_URL}/api/payments/card-webhook`,

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
  console.error("CREATE CARD PAYMENT ERROR:", err.message);

  return res.status(500).json({
    success: false,
    error: err.message
  });
}
}