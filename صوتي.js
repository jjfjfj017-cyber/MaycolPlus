//حقوق المطور اوبيتو
//لـcods: اوبيتو⚡
//لـapi: زورو 🐉
const obitosar = async (m, { conn, args, command, usedPrefix }) => {
    let loadingSticker = '⏳'; 
    let doneSticker = '✅';

    m.react(loadingSticker);

    if (!args.length) {
        throw `*❗ مــن فضلك، ادخل نصًا لتحويله إلى صوت.*`;
    }

    const textToConvert = args.join(" "); // يجمع كل الأجزاء المتبقية من النص

    try {
        await m.reply(`*⏳ جـارٍ الـعـمـل... تـمـهـل*`);
        const taguser = '@' + m.sender.split("@s.whatsapp.net")[0];
        const apiURL = `https://zoro-foryou.vercel.app/api/text2speech/male?text=${encodeURIComponent(textToConvert)}`;

        const response = await fetch(apiURL);

        if (!response.ok) {
            const errorMessage = await response.json();
            throw `*❗خطاء في التحميل: ${errorMessage.message || 'حدث خطأ غير معروف'}*`;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        if (!buffer || buffer.length === 0) {
            throw `*❗خطاء في التحميل، المحتوى فارغ*`;
        }

        await conn.sendMessage(m.chat, { 
            audio: buffer, 
            mimetype: 'audio/mp4', 
            ptt: true 
        });

        m.react(doneSticker);
        
    } catch (err) {
        console.error("❗خطاء في التحميل:", err);
        throw `*❗خطاء في التحميل: ${err.message || err}*`;
    }
};

obitosar.command = /^(فويس)$/i;
export default obitosar;
