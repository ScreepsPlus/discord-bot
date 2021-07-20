import axios from 'axios'
import { Client } from 'discord.js'

const COMMAND_TYPE = {
  SUB_COMMAND:	1,
  SUB_COMMAND_GROUP:	2,
  STRING:	3,
  INTEGER:	4,
  BOOLEAN:	5,
  USER:	6,
  CHANNEL:	7,
  ROLE:	8,
  MENTIONABLE: 9
}

const optsFromInteraction = interaction => interaction.data.options.reduce((l, o) => { l[o.name] = o.value; return l }, {})

const commands = [
  {
    name: 'link',
    description: 'Link a room',
    async run ({ interaction, reply }) {
      console.log(interaction.data.options)
      const { shard, room, comment = '' } = optsFromInteraction(interaction)
      const sub = shard === 'shardSeason' ? 'season' : 'a'
      const url = `https://screeps.com/${sub}/#!/room/${shard}/${room}`
      await reply({
        type: 4,
        data: {
          content: `Room link: [${shard} - ${room}](${url}) ${comment}`,
          flags: 0
        }      
      })
    },
    options: [
      {
        name: 'shard',
        description: 'Shard to link',
        type: COMMAND_TYPE.STRING,
        required: true,
        choices: ['shard0', 'shard1', 'shard2', 'shard3', 'shardSeason'].map(v => ({ name: v, value: v })),
      },
      {
        name: 'room',
        description: 'Room to link',
        type: COMMAND_TYPE.STRING,
        required: true
      },
      {
        name: 'comment',
        description: 'Optional comment for link',
        type: COMMAND_TYPE.STRING,
        required: false
      }
    ]
  },
  {
    name: 'screepsplus',
    description: 'ScreepsPlus commands',
    async run(opts) {
      const subcommand = opts.interaction.data.options[0].name
      this.options.find(o => o.name === subcommand).run(opts)
    },
    options: [
      {
        name: 'info',
        description: 'Info',
        type: COMMAND_TYPE.SUB_COMMAND,
        required: false,
        async run ({ interaction, client, guild, user, reply }) {
          await reply({
            type: 4,
            data: {
              content: `TODO: ScreepsPlus info here :D`
            }
          })
        }
      }
    ]
  }
]

/**
 * 
 * @param {Client} client 
 * @param {string} token Bot Token
 * @param {string} guild Guild ID
 */
export async function registerSlashCommands (client, token, guild = '') {
  const app = await client.fetchApplication()
  const url = guild ?
    `https://discord.com/api/v8/applications/${app.id}/guilds/${guild}/commands` :
    `https://discord.com/api/v8/applications/${app.id}/commands`
  // for (const command of commands) {
  console.log(`Registering commands for guild: ${guild}`)
  await axios.put(url, commands, {
    headers: {
      Authorization: `Bot ${token}`
    }
  })
  // }
  client.ws.on("INTERACTION_CREATE", async interaction => {
    const guild = client.guilds.cache.get(interaction.guild_id);
    const user = client.users.cache.get(interaction.member.user.id);
    let replied = false
    const reply = async data => {
      if (replied) return console.log('Double reply!')
      replied = true
      if (typeof data === 'string') {
        data = {
          type: 4,
          data: {
            content: data
          }
        }
      }
      await client.api.interactions(interaction.id, interaction.token).callback.post({ data }).catch(console.error)
    }
    const command = commands.find(c => c.name === interaction.data.name)
    if (command) {
      await command.run({ interaction, client, guild, user, reply })
    }
  });
}