import axios from 'axios';

const handler = async (m, { conn, text }) => {
  try {
    // Si no hay texto para el aviso
    if (!text) return m.reply('⚠️ Ingresa el aviso que quieres enviar.');

    // Extraer número del remitente
    const sender = m.sender.split('@')[0];

    // Lista de owners definida en global
    const isOwner = global.owner?.some(([num]) => sender === num);

    if (!isOwner) {
      // Decoración para el NO owner
      let alerta = `
━━━━━━ ◦ ❖ ◦ ━━━━━━
ㅤㅤㅤ𝐀𝐥𝐞𝐫𝐭𝐚 ⚠️
━━━━━━ ◦ ❖ ◦ ━━━━━━

🚫 Lo siento, no tienes permisos para usar este comando.  

📱 Número: ${sender}  
🆔 ID: ${m.sender}  
      `;
      return m.reply(alerta);
    }

    // Buscar el nombre del owner que lo ejecutó
    let ownerData = global.owner.find(([num]) => sender === num);
    let nombreOwner = ownerData ? ownerData[1] : "Owner Desconocido";

    // Aviso decorado
    let aviso = `
━━━━━━ ◦ ❖ ◦ ━━━━━━
ㅤ${global.namecanal}
ㅤㅤㅤㅤㅤᴬᵛⁱˢᵒ
━━━━━━ ◦ ❖ ◦ ━━━━━━

${text}

ᴬᵗᵗ• ${nombreOwner}
    `;

    // Enviar al canal
    await conn.sendMessage(global.idcanal, {
      text: aviso
    });

    m.reply('✅ Aviso enviado correctamente al canal.');
  } catch (e) {
    console.error(e);
    m.reply('⚠️ Hubo un error al intentar enviar el aviso.');
  }
};

handler.command = ['aviso'];
handler.help = ['aviso <texto>'];
handler.tags = ['owner']; // pero la validación ya se hace con global.owner
export default handler;
