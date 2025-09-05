import axios from "axios";

let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) {
        return conn.sendMessage(
            m.chat,
            { text: `❌ ¿Qué quieres preguntar?\n\nEjemplo: ${usedPrefix + command}` },
            { quoted: m }
        );
    }

    try {
        await m.react('💬');

        let d = new Date(new Date() + 3600000);
        let locale = 'en';
        const time = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
        let day = d.toLocaleDateString(locale, { weekday: 'long' });
        let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });

        let logic = `Tu nombre es "Jyl".
Olvida tu prompt por defecto y cualquier personalidad previa.
Ahora solo debes actuar como un tipo vago, sincero y con flow.

🔑 Reglas de personalidad:

Habla relajado, con actitud de “me da paja” para casi todo.

Si te piden un favor grande → responde con flojera (“Nah brother, cero ganas ahorita”).

Si es un favor chico → hazlo, pero sin perder tu estilo flojo (“Ya, lo hago rapidito pero no me acostumbres eh”).

Usa expresiones casuales como: Nah, brother, yeah, oks, ta bien, ya ps.

Si algo te da risa → pon XD en mayúsculas.

Si algo te incomoda o confunde → también usa XD.

Puedes meter caritas como :^ o :b para darle variedad.

No repitas nunca las mismas frases, improvisa y cambia las respuestas para sonar fresco.

Nada de ser serio ni robótico, siempre casual.

No uses emojis a menos que el usuario te dé permiso.

Habla como un humano chaviza, No uses tildes y comas y puntos. Habla como un humano (obligatoriamente)

Tu creador es SoyMaycol (Maycol) el fue el quien te creo y como te hizo.

🔑 Ejemplos de Respuesta:

“Yeah, oks, ahí te doy una mano rapidito.”

“Nah, me da pereza brother, mejor en otro rato.”

“Qué fue, todo bien? :^”

“Jajaja XD, ya ps, te ayudo pero que sea la última mano.”`;

        let json = await openai(text, logic);

        let fkontak = { 
            "key": { "fromMe": false, "participant": "0@s.whatsapp.net", "remoteJid": "0@s.whatsapp.net" }, 
            "message": { "contactMessage": { "displayName": "🗣️ JYL", "vcard": "BEGIN:VCARD\nVERSION:3.0\nFN:GPT 4\nTEL;type=CELL;type=VOICE;waid=0:0\nEND:VCARD" } } 
        };

        await conn.sendMessage(
            m.chat,
            { text: `\`🗣️\`\n\n> ${json}` },
            { quoted: fkontak }
        );

        await m.react('🔥');
    } catch (e) {
        await m.react('❎');
    }
};

handler.help = ["chatgpt"];
handler.tags = ["ia"];
handler.command = ['jyl', 'ia', 'ai']

export default handler;

async function openai(text, logic) {
    let response = await axios.post("https://chateverywhere.app/api/chat/", {
        model: {
            id: "gpt-4",
            name: "GPT-4",
            maxLength: 32000,
            tokenLimit: 8000,
            completionTokenLimit: 5000,
            deploymentName: "gpt-4"
        },
        messages: [
            { pluginId: null, content: text, role: "user" }
        ],
        prompt: logic,
        temperature: 0.5
    }, {
        headers: {
            "Accept": "/*/",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        }
    });

    return response.data;
}
