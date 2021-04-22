const { MessageEmbed } = require('discord.js');
const { reply } = require('./slashLibrary')

const cost = 50;

module.exports = {
    createSlashAnonymous: function createSlashAnonymous(client, server) {
        client.api.applications(client.user.id).guilds(server.id).commands.post({
            data: {
                name: "anonymous",
                description: "Send an anonymous message in your current channel.",
                options: [
                    {
                        "name": "message",
                        "description": "Type your message.",
                        "type": 3,
                        "required": true,
                    }
                ]
            }
        })
    },

    anonymous: function anonymous(interaction, client) {
        const prefix = (client.db.settings.selectPrefix.pluck().get(interaction.guild_id))
        const anonymousAllowed = (client.db.settings.selectAnonymous.pluck().get(interaction.guild_id))
        const anonMsg = interaction.data.options[0].value;
        console.log( {anonymousAllowed})
        if (!anonymousAllowed) {
            reply(interaction, `This server doesn't allow anonymous messages. An admin can change this by typing \`${prefix}toggleanonymous\``, client)
        } else {
            const points = (client.db.users.selectPoints.pluck().get(interaction.member.user.id, interaction.guild_id))
            if (!points || points < cost)
                reply(interaction, `**You need ${cost-points} more points to send an anonymous message in this server.**\n\nTo check your points, type \`${prefix}points\``, client)
            else {
                const channel = client.channels.cache.get(interaction.channel_id)
                const embed = new MessageEmbed()
                    .setTitle(`Anonymous Message`)
                    .setDescription(`"${anonMsg}"`)
                    .setFooter("To send an anonymous message, type /anonymous")
                    .setColor("RANDOM");
                channel.send(embed).then(()=>{
                    client.db.users.setPoints.run(points - cost, interaction.member.user.id, interaction.guild_id)
                    reply(interaction, `Your anonymous message has been posted! Remaining points: **\`${points - cost}\`**.`, client)
                })
            }
        }
    }
}