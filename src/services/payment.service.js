import { paysync } from "../config/paysync.js";
import { activatePlan } from "./subscription.service.js";
import { plans } from "../config/plans.config.js";

function getPaymentProductId(payment) {
  return (
    payment.productId ||
    payment.product_id ||
    payment.product?.id ||
    payment.product?.productId ||
    payment.product?.product_id
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

  const productId = getPaymentProductId(payment);

  if (!productId) {
    throw new Error("Produto do pagamento não encontrado.");
  }

  const selectedPlan = plans[productId];

  if (!selectedPlan) {
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