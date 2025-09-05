import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const prompt = args.join(' ')
  if (!prompt) return m.reply(
`✿ *Generador de Imágenes AI*

Sigue las instrucciones:
✎ *Uso correcto ›* ${usedPrefix + command} <texto para la imagen>
✎ *Ejemplo ›* ${usedPrefix + command} gatito kawaii con fondo rosa

Recuerda que la imagen puede tardar unos segundos en generarse.
↺ Sé paciente mientras se crea tu imagen.`)

  try {
    // Reaccionar con reloj mientras genera
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    // Llamada a tu API que devuelve la imagen directamente
    const api = `https://api.siputzx.my.id/api/ai/flux?prompt=${encodeURIComponent(prompt)}`
    const res = await fetch(api)
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`)

    // Convertir la respuesta en buffer (imagen)
    const buffer = await res.buffer()

    // Enviar la imagen con botones
    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: `
✿ *Imagen Generada* :)

Detalles:
✎ *Prompt ›* ${prompt}
↺ Disfruta tu nueva creación espiritual...
      `.trim(),
      footer: 'MaycolPlus',
      buttons: [
        { buttonId: `${usedPrefix}${command} ${prompt}`, buttonText: { displayText: '★ Otra' }, type: 1 },
        { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '♥ Ir al menu' }, type: 1 }
      ],
      headerType: 4
    }, { quoted: m })

    // Reaccionar con check
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error('Error generando imagen:', e)
    await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } })
    m.reply('✿ *Error ›* No se pudo generar la imagen, inténtalo más tarde.')
  }
}

handler.command = ['imgia', 'iaimg']
handler.help = ['imgia']
handler.tags = ['ia']

export default handler
