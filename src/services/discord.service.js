export async function sendDiscordMessage(message) {
  try {
    if (!process.env.DISCORD_WEBHOOK_URL) {
      console.log("Discord webhook não configurado.");
      return;
    }

    const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: message
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.log("Erro ao enviar mensagem no Discord:", error);
    }
  } catch (err) {
    console.log("Erro Discord:", err.message);
  }
}