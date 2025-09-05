import fetch from "node-fetch"
import { spawn } from "child_process"
import { tmpdir } from "os"
import { join } from "path"
import fs from "fs"


async function toWebp(buffer) {
  let tmpIn = join(tmpdir(), `input_${Date.now()}.png`)
  let tmpOut = join(tmpdir(), `output_${Date.now()}.webp`)
  fs.writeFileSync(tmpIn, buffer)

  await new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-i", tmpIn,
      "-vf", "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=white",
      "-vcodec", "libwebp",
      "-lossless", "1",
      "-qscale", "75",
      "-preset", "default",
      "-an", "-vsync", "0",
      tmpOut
    ])

    ffmpeg.on("close", (code) => {
      if (code !== 0) reject(new Error("Error en ffmpeg"))
      else resolve()
    })
  })

  let webp = fs.readFileSync(tmpOut)
  fs.unlinkSync(tmpIn)
  fs.unlinkSync(tmpOut)
  return webp
}

let handler = async (m, { conn, args }) => {
  const prompt = args.join(" ")
  if (!prompt) return m.reply("⚠️ Escribe un texto para generar el sticker.")

  try {
    const api = `https://api.siputzx.my.id/api/ai/flux?prompt=${encodeURIComponent(prompt)}`
    const res = await fetch(api)
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`)

    const buffer = await res.buffer()
    const webp = await toWebp(buffer)

    await conn.sendMessage(m.chat, { sticker: webp }, { quoted: m })

  } catch (e) {
    console.error("Error generando sticker:", e)
    m.reply("❌ No se pudo generar el sticker, intenta más tarde.")
  }
}

handler.command = ["aisticker", "aistiker", "stickerai"]
handler.tags = ["sticker"]
handler.help = ["aisticker"]


export default handler
