const fetch = require('node-fetch');

const handler = async (msg, { conn, args, command }) => {
  const chatId = msg.key.remoteJid;
  const text = args.join(" ");
  const participant = msg.key.participant || msg.key.remoteJid;

  if (!text) {
    return conn.sendMessage(chatId, {
      text: `🚪👻 *Uso de ${command}:* escribe el deseo para que Hanako-kun lo cumpla en un video.`,
    }, { quoted: msg });
  }

  try {
    if (msg?.key) await conn.sendMessage(chatId, { react: { text: "🔮", key: msg.key } });
    if (msg?.key) await conn.sendMessage(chatId, { react: { text: "🕯️", key: msg.key } });

    const apiURL = `https://myapiadonix.vercel.app/ai/veo3?prompt=${encodeURIComponent("Hanako Kun style: " + text)}`;
    const res = await fetch(apiURL);
    const json = await res.json();

    if (!json.success || !json.video_url) throw new Error(json.message || "El fantasma de Hanako no pudo generar el video...");

    const videoUrl = json.video_url.trim();
    const videoRes = await fetch(videoUrl);
    const buffer = await videoRes.arrayBuffer().then(ab => Buffer.from(ab));

    await conn.sendMessage(chatId, {
      video: buffer,
      caption: `
━━━━━━━━━━━━━━
*_Magia Generada_*
━━━━━━━━━━━━━━
> Ahora me vas a pagar... Con Tu Cuerpo <3
> Usando AdonixAPI uwu
━━━━━━━━━━━━━━
      `,
      gifPlayback: false
    }, { quoted: msg.key ? msg : null });

    if (msg?.key) await conn.sendMessage(chatId, { react: { text: "✅", key: msg.key } });

  } catch (err) {
    console.error("❌ Error en comando Hanako-kun video:", err);

    if (msg?.key) {
      await conn.sendMessage(chatId, { react: { text: "💀", key: msg.key } });
    }

    conn.sendMessage(chatId, {
      text: "👻❌ Hanako-kun no pudo cumplir tu deseo en video.",
    }, { quoted: msg });
  }
};

handler.command = ["hanakokunvideo", "hanakovideo", "videohanako"];
handler.tags = ["hanako"];
handler.help = ["hanakokunvideo <deseo>"];
module.exports = handler;
