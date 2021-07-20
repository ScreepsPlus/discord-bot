import Discord, { Activity, ActivityFlags, MessageEmbed } from 'discord.js'
import { registerSlashCommands } from './slash.js'
import yaml from 'js-yaml'
import { readFile } from 'fs/promises'

const DEBUG = process.env.NODE_ENV !== 'production'

const { token = '', guilds = [] } = yaml.load(await readFile('config.yml'), 'UTF8')

const client = new Discord.Client({

})

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`)
  
  if (!guilds.length) {
    guilds.push('')
  }
  for (const guild of guilds) {
    await registerSlashCommands(client, token, guild)
  }
  client.user.setActivity('The Warpath', { type: 'WATCHING' })
})

client.on('message', async message => {
  // If the message is "ping"
  if (DEBUG) {
    if (message.content === 'ping') {
      // Send "pong" to the same channel
      message.channel.send('pong')
    }
  }
  
  if (message.content.match(/screepsplus/i)) {
    await message.react('<:splus:865248046328315914>')
    await message.react('👀')
  }
})

client.login(token)