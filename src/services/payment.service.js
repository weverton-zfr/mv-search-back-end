import { paysync } from "../config/paysync.js";
import { activatePlan } from "./subscription.service.js";
import { plans } from "../config/plans.config.js";

function findPlanByName(productName) {
  return Object.values(plans).find(
    (plan) => plan.name === productName
  );
}

export async function checkAndActivate({ paymentId, userId }) {
  const response = await paysync.get(`/payments/${paymentId}`);

  const payment = response.data;

  if (payment.status !== "paid") {
    return {
      paid: false,
      payment
    };
  }

  const selectedPlan = findPlanByName(payment.productName);

  if (!selectedPlan) {
    console.error("PLAN NOT FOUND BY PRODUCT NAME:", {
      productName: payment.productName,
      availablePlans: Object.values(plans).map((plan) => plan.name),
      payment
    });

    throw new Error("Plano do pagamento não encontrado ou inativo.");
  }

  await activatePlan({
    userId,
    plan: selectedPlan.name,
    paymentId
  });

  return {
    paid: true,
    payment,
    plan: selectedPlan.name
  };
}