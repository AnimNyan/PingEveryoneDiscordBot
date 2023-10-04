const { ApplicationCommandOptionType, PermissionFlagsBits } = require ('discord.js');
const NotificationChannel = require('../../models/NotificationChannel');

module.exports = {
    name: 'clear-notification-channel',
    description: 'Clears the notification roles and channels.',
    // devOnly: Boolean,
    // testOnly: Boolean,
    permissionsRequired: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.Administrator],

    callback: async (client, interaction) => {

        const guildIDString = String(interaction.guild.id);
        //console.log(`This is the guildID ${guildIDString}`);

        try {
            //this deleteOne function deletes one document that has the current guildID
            await NotificationChannel.deleteOne({guildID: guildIDString});
            
            interaction.reply(`Successfully cleared the notifications channel!`);
        } catch (err) {
            console.log(err);

            interaction.reply(`There was an error with the clear-notification-channel command, please contact the developer <@845327968674775061>`);
        }

        
    }
}