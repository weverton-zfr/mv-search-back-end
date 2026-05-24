import cron from "node-cron";
import { expireSubscriptions } from "../services/subscription.service.js";

export function startSubscriptionJob() {
  cron.schedule("*/10 * * * *", async () => {
    try {
      const expired = await expireSubscriptions();

      if (expired?.length > 0) {
        console.log(`Planos expirados atualizados: ${expired.length}`);
      }
    } catch (err) {
      console.error("Erro ao expirar assinaturas:", err.message);
    }
  });
}