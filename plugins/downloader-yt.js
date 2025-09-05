// Codigo de SoyMaycol y no quites creditos 
import yts from "yt-search";

const limit = 100;

const handler = async (m, { conn, text, command }) => {
    if (!text) return m.reply(`╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ Ay bebé, necesito algo para trabajar~
├─ Dame el nombre de un video o URL de YouTube
├─ y yo haré magia para ti... ♡
│
├─ ¿No sabes cómo usarme? Escribe:
│   ⇝ .help
├─ Te aseguro que valdré la pena~
╰─✦`);

    await m.react("🔥");

    try {
        const res = await yts(text);
        if (!res || !res.videos || res.videos.length === 0) {
            return m.reply(`╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ Mmm... no encuentro nada así bebé
├─ Intenta con algo más específico
├─ que me haga sudar un poquito~ ♡
╰─✦`);
        }

        const video = res.videos[0];
        const title = video.title || "Sin título";
        const authorName = video.author?.name || "Desconocido";
        const durationTimestamp = video.timestamp || "Desconocida";
        const views = video.views || "Desconocidas";
        const url = video.url || "";
        const thumbnail = video.thumbnail || "";

        const isDirectDownload = ["play", "playaudio", "ytmp3", "play2", "playvid", "ytv", "ytmp4"].includes(command);

        if (isDirectDownload) {
            const initialMessage = `╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ Ooh~ encontré algo delicioso:
├─ 「❀」${title}
│
├─ ✧ Canal: ${authorName}
├─ ✧ Duración: ${durationTimestamp}
├─ ✧ Vistas: ${views}
│
├─ Déjame trabajar mi magia... ♡
├─ ▓░░░░░░░░░ 10%
├─ Esto se va a poner caliente~
╰─✦`;

            let sentMessage;
            if (thumbnail) {
                sentMessage = await conn.sendMessage(m.chat, {
                    image: { url: thumbnail },
                    caption: initialMessage,
                }, { quoted: m });
            } else {
                sentMessage = await conn.sendMessage(m.chat, {
                    text: initialMessage,
                }, { quoted: m });
            }

            if (["play", "playaudio", "ytmp3"].includes(command)) {
                await downloadAudio(conn, m, url, title, sentMessage, thumbnail);
            } else if (["play2", "playvid", "ytv", "ytmp4"].includes(command)) {
                await downloadVideo(conn, m, url, title, sentMessage, thumbnail);
            }
        } else {
            const buttons = [
                { buttonId: `.ytmp3 ${url}`, buttonText: { displayText: "♪ Audio Seductor ♪" }, type: 1 },
                { buttonId: `.ytmp4 ${url}`, buttonText: { displayText: "♣ Video Caliente ♣" }, type: 1 },
            ];

            const processingMessage = `╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ Mmm~ qué delicia tenemos aquí:
├─ 「❀」${title}
│
├─ ✧ Canal: ${authorName}
├─ ✧ Duración: ${durationTimestamp}
├─ ✧ Vistas: ${views}
│
├─ ¿Qué prefieres bebé?
├─ Algo para los oídos o para los ojos~ ♡
╰─✦`;

            try {
                if (thumbnail) {
                    await conn.sendMessage(m.chat, {
                        image: { url: thumbnail },
                        caption: processingMessage,
                        buttons,
                        headerType: 4,
                    }, { quoted: m });
                } else {
                    await conn.sendMessage(m.chat, {
                        text: processingMessage,
                        buttons,
                        headerType: 1,
                    }, { quoted: m });
                }
            } catch {
                await m.reply(processingMessage + "\n\nDime qué quieres amor:\n• 1 para audio\n• 2 para video");
            }
        }

    } catch (error) {
        console.error("Error general:", error);
        await m.reply(`╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ Ay no bebé, algo salió mal...
├─ Pero no te preocupes, sigo siendo tuya~ ♡
├─ Error: ${error.message}
├─ Inténtalo otra vez, prometo portarme bien
╰─✦`);
        await m.react("💔");
    }
};

const downloadAudio = async (conn, m, url, title, sentMessage, thumbnail) => {
    let progress = 10;
    let progressInterval;
    let lastProgressText = "";

    try {
        const cleanTitle = cleanName(title) + ".mp3";
        
        progressInterval = setInterval(async () => {
            if (progress < 80) {
                progress += Math.floor(Math.random() * 5) + 2;
                if (progress > 80) progress = 80;
                
                const progressBar = createProgressBar(progress);
                const sexyMessages = [
                    "Esto se está poniendo intenso~",
                    "Déjame seguir trabajando para ti♡",
                    "Casi estoy lista bebé~",
                    "Un poquito más y será tuyo♡"
                ];
                const randomMessage = sexyMessages[Math.floor(Math.random() * sexyMessages.length)];
                
                const newMessage = `╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ 「❀」${title}
│
├─ ${randomMessage}
├─ ✧ Preparando tu audio sensual...
│
├─ ${progressBar} ${progress}%
├─ No pares de mirarme trabajar~ ♡
╰─✦`;

                if (newMessage !== lastProgressText) {
                    lastProgressText = newMessage;
                    await updateMessage(conn, m.chat, sentMessage, newMessage, thumbnail);
                }
            }
        }, 800);

        const apiUrl = `https://myapiadonix.casacam.net/download/yt?url=${encodeURIComponent(url)}&format=audio`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data || data.status !== "ok" || !data.success || !data.data.url) {
            throw new Error("No pude conseguir lo que querías bebé");
        }

        progress = 90;
        const progressBar90 = createProgressBar(progress);
        const message90 = `╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ 「❀」${title}
│
├─ ✧ Calidad: ${data.data.quality}
├─ Ya casi termino contigo~ ♡
│
├─ ${progressBar90} ${progress}%
├─ Preparándome para dártelo todo...
╰─✦`;

        await updateMessage(conn, m.chat, sentMessage, message90, thumbnail);
        clearInterval(progressInterval);

        await conn.sendMessage(m.chat, {
            audio: { url: data.data.url },
            mimetype: "audio/mpeg",
            fileName: cleanTitle,
        }, { quoted: m });

        const progressBar100 = createProgressBar(100);
        const finalMessage = `╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ 「❀」${title}
│
├─ ✧ Calidad: ${data.data.quality}
├─ ¡Listo mi amor! ♡
│
├─ ${progressBar100} 100%
├─ Espero que disfrutes lo que hice para ti~
├─ ¿Quieres que haga algo más? ♡
╰─✦`;

        await updateMessage(conn, m.chat, sentMessage, finalMessage, thumbnail);
        await m.react("💋");

    } catch (error) {
        clearInterval(progressInterval);
        console.error("Error descargando audio:", error);
        
        const errorMessage = `╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ 「❀」${title}
│
├─ Ay bebé... algo no salió bien
├─ Pero no te rindas conmigo~ ♡
├─ ${error.message}
├─ Inténtalo otra vez, prometo compensarte
╰─✦`;

        await updateMessage(conn, m.chat, sentMessage, errorMessage, thumbnail);
        await m.react("😢");
    }
};

const downloadVideo = async (conn, m, url, title, sentMessage, thumbnail) => {
    let progress = 10;
    let progressInterval;
    let lastProgressText = "";

    try {
        const cleanTitle = cleanName(title) + ".mp4";
        
        progressInterval = setInterval(async () => {
            if (progress < 80) {
                progress += Math.floor(Math.random() * 5) + 2;
                if (progress > 80) progress = 80;
                
                const progressBar = createProgressBar(progress);
                const hotMessages = [
                    "Mira cómo trabajo para ti~",
                    "Este video va a estar delicioso♡",
                    "Casi puedes tenerme completa~",
                    "No pares de verme trabajar bebé♡"
                ];
                const randomMessage = hotMessages[Math.floor(Math.random() * hotMessages.length)];
                
                const newMessage = `╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ 「❀」${title}
│
├─ ${randomMessage}
├─ ✧ Procesando tu video caliente...
│
├─ ${progressBar} ${progress}%
├─ Te va a encantar lo que viene~ ♡
╰─✦`;

                if (newMessage !== lastProgressText) {
                    lastProgressText = newMessage;
                    await updateMessage(conn, m.chat, sentMessage, newMessage, thumbnail);
                }
            }
        }, 800);

        const apiUrl = `https://myapiadonix.casacam.net/download/yt?url=${encodeURIComponent(url)}&format=video`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data || data.status !== "ok" || !data.success || !data.data.url) {
            throw new Error("No pude darte lo que querías amor");
        }

        progress = 90;
        const progressBar90 = createProgressBar(progress);
        const message90 = `╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ 「❀」${title}
│
├─ ✧ Calidad: ${data.data.quality}
├─ Ya casi es tuyo completamente~ ♡
│
├─ ${progressBar90} ${progress}%
├─ Preparando la gran revelación...
╰─✦`;

        await updateMessage(conn, m.chat, sentMessage, message90, thumbnail);
        clearInterval(progressInterval);

        await conn.sendMessage(m.chat, {
            video: { url: data.data.url },
            mimetype: "video/mp4",
            fileName: cleanTitle,
        }, { quoted: m });

        const progressBar100 = createProgressBar(100);
        const finalMessage = `╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ 「❀」${title}
│
├─ ✧ Calidad: ${data.data.quality}
├─ ¡Aquí tienes todo bebé! ♡
│
├─ ${progressBar100} 100%
├─ ¿Te gustó cómo lo hice?~
├─ Siempre estoy lista para más... ♡
╰─✦`;

        await updateMessage(conn, m.chat, sentMessage, finalMessage, thumbnail);
        await m.react("🔥");

    } catch (error) {
        clearInterval(progressInterval);
        console.error("Error descargando video:", error);
        
        const errorMessage = `╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ 「❀」${title}
│
├─ Oh no amor... hubo un problemita
├─ Pero sabes que siempre vuelvo por más~ ♡
├─ ${error.message}
├─ Dale otra oportunidad a tu MaycolPlus
╰─✦`;

        await updateMessage(conn, m.chat, sentMessage, errorMessage, thumbnail);
        await m.react("😈");
    }
};

const updateMessage = async (conn, chatId, sentMessage, newText, thumbnail) => {
    try {
        const messageKey = sentMessage.key;
        
        if (thumbnail) {
            try {
                await conn.relayMessage(chatId, {
                    protocolMessage: {
                        key: messageKey,
                        type: 14,
                        editedMessage: {
                            imageMessage: {
                                url: thumbnail,
                                caption: newText
                            }
                        }
                    }
                }, {});
            } catch {
                try {
                    await conn.sendMessage(chatId, {
                        edit: messageKey,
                        text: newText
                    });
                } catch {
                    console.log("No se pudo editar el mensaje");
                }
            }
        } else {
            try {
                await conn.sendMessage(chatId, {
                    edit: messageKey,
                    text: newText
                });
            } catch {
                try {
                    await conn.relayMessage(chatId, {
                        protocolMessage: {
                            key: messageKey,
                            type: 14,
                            editedMessage: {
                                conversation: newText
                            }
                        }
                    }, {});
                } catch {
                    console.log("No se pudo editar el mensaje de texto");
                }
            }
        }
    } catch (error) {
        console.error("Error actualizando mensaje:", error.message);
    }
};

const createProgressBar = (percentage) => {
    const totalBars = 10;
    const filledBars = Math.floor((percentage / 100) * totalBars);
    const emptyBars = totalBars - filledBars;
    
    const filled = "▓".repeat(filledBars);
    const empty = "░".repeat(emptyBars);
    
    return filled + empty;
};

function cleanName(name) {
    return name.replace(/[^\w\s-_.]/gi, "").substring(0, 50);
}

handler.command = handler.help = ["play", "playaudio", "ytmp3", "play2", "playvid", "ytv", "ytmp4", "yt"];
handler.tags = ["descargas"];
handler.register = true;

export default handler;
