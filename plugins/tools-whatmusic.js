/* Codigo de "La Suki Bot"  
---> Modificado por SoyMaycol */  
import fs from 'fs'  
import path from 'path'  
import axios from 'axios'  
import ffmpeg from 'fluent-ffmpeg'  
import FormData from 'form-data'  
import { promisify } from 'util'  
import { pipeline } from 'stream'  
import { downloadContentFromMessage } from '@whiskeysockets/baileys'  
import yts from 'yt-search'  

const streamPipeline = promisify(pipeline)  

const handler = async (msg, { conn }) => {  
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage  
  if (!quotedMsg || (!quotedMsg.audioMessage && !quotedMsg.videoMessage)) {  
    await conn.sendMessage(msg.key.remoteJid, {  
      text: `✧ Responde a un *audio*, *nota de voz* o *video* y MaycolPlus con el toque perverso de Hanako-kun lo identificará… 😏`  
    }, { quoted: msg })  
    return  
  }  

  await conn.sendMessage(msg.key.remoteJid, {  
    react: { text: '🔮', key: msg.key }  
  })  

  try {  
    const tmpDir = path.join(process.cwd(), 'tmp')  
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)  
    const fileExt = quotedMsg.audioMessage ? 'mp3' : 'mp4'  
    const inputPath = path.join(tmpDir, `${Date.now()}.${fileExt}`)  

    const stream = await downloadContentFromMessage(  
      quotedMsg.audioMessage || quotedMsg.videoMessage,  
      quotedMsg.audioMessage ? 'audio' : 'video'  
    )  
    const writer = fs.createWriteStream(inputPath)  
    for await (const chunk of stream) writer.write(chunk)  
    writer.end()  

    const form = new FormData()  
    form.append('reqtype', 'fileupload')  
    form.append('fileToUpload', fs.createReadStream(inputPath))  

    const upload = await axios.post('https://catbox.moe/user/api.php', form, {  
      headers: form.getHeaders()  
    })  
    if (!upload.data || typeof upload.data !== 'string' || !upload.data.startsWith('http')) {  
      throw new Error('El archivo no quiso mostrarse en Catbox… qué travieso 😏')  
    }  

    const apiURL = `https://api.neoxr.eu/api/whatmusic?url=${encodeURIComponent(upload.data)}&apikey=obscSw`  
    const res = await axios.get(apiURL).catch(() => ({ data: {} }))  
    if (!res.data.status || !res.data.data) {  
      throw new Error('Hanako-kun se sonrojó y no logró identificar esta melodía…')  
    }  

    const { title, artist, album, release } = res.data.data  
    const ytSearch = await yts(`${title} ${artist}`)  
    const video = ytSearch.videos[0]  
    if (!video) throw new Error('No hallé ese ritmo en YouTube… ¿me estás probando? 😏')  

    const banner = `  
╔═══════════════╗  
║ ✦ 𝗠𝗮𝘆𝗰𝗼𝗹𝗣𝗹𝘂𝘀 ✦  
╚═══════════════╝  

✧ 𝐂𝐚𝐧𝐜𝐢ó𝐧 𝐝𝐞𝐭𝐞𝐜𝐭𝐚𝐝𝐚 ✧  

『📌』Título: ${title}    
『👤』Artista: ${artist}    
『💿』Álbum: ${album}    
『📅』Lanzamiento: ${release}    
『🔎』Buscando: ${video.title}    
『⏱』Duración: ${video.timestamp}    
『👁』Vistas: ${video.views.toLocaleString()}    
『📺』Canal: ${video.author.name}    
『🔗』Link: ${video.url}    

Hanako-kun susurra: "¿Quieres escucharla? Yo te la pongo… pero no me mires así jeje"  
`  

    await conn.sendMessage(msg.key.remoteJid, {  
      image: { url: video.thumbnail },  
      caption: banner  
    }, { quoted: msg })  

    const ytRes = await axios.get(`https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(video.url)}&type=audio&quality=128kbps&apikey=russellxz`).catch(() => ({ data: {} }))  
    if (!ytRes.data || !ytRes.data.data || !ytRes.data.data.url) throw new Error('No pude conseguir el audio de YouTube 😣')  

    const audioURL = ytRes.data.data.url  
    const rawPath = path.join(tmpDir, `${Date.now()}_raw.m4a`)  
    const finalPath = path.join(tmpDir, `${Date.now()}_final.mp3`)  

    const audioRes = await axios.get(audioURL, { responseType: 'stream' })  
    await streamPipeline(audioRes.data, fs.createWriteStream(rawPath))  

    await new Promise((resolve, reject) => {  
      ffmpeg(rawPath)  
        .audioCodec('libmp3lame')  
        .audioBitrate('128k')  
        .save(finalPath)  
        .on('end', resolve)  
        .on('error', reject)  
    })  

    await conn.sendMessage(msg.key.remoteJid, {  
      audio: fs.readFileSync(finalPath),  
      mimetype: 'audio/mpeg',  
      fileName: `${title}.mp3`  
    }, { quoted: msg })  

    fs.unlinkSync(inputPath)  
    fs.unlinkSync(rawPath)  
    fs.unlinkSync(finalPath)  

    await conn.sendMessage(msg.key.remoteJid, {  
      react: { text: '💋', key: msg.key }  
    })  

  } catch (err) {  
    await conn.sendMessage(msg.key.remoteJid, {  
      text: `✖️ Hanako-kun se puso nervioso: ${err.message}`  
    }, { quoted: msg })  
    await conn.sendMessage(msg.key.remoteJid, {  
      react: { text: '💢', key: msg.key }  
    })  
  }  
}  

handler.command = ['whatmusic']  
handler.tags = ['tools']  
export default handler
