import { paysync } from "../config/paysync.js";

export async function createPaySyncCardPayment(data) {
  try {
    const response = await paysync.post("/card-payments", data);

    return response.data;
  } catch (err) {
    console.error(
      "PAYSYNC CARD PAYMENT ERROR:",
      err?.response?.data || err.message
    );

    throw new Error(
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      "Erro ao criar pagamento com cartão"
    );
  }
}