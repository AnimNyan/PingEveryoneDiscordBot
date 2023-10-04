const { ApplicationCommandOptionType, PermissionFlagsBits } = require ('discord.js');
const NotificationChannel = require('../../models/NotificationChannel');

module.exports = {
    name: 'set-notification-channel',
    description: 'Sets the notification role and channel.',
    // devOnly: Boolean,
    // testOnly: Boolean,
    options: [
        {
            name: 'notification-channel',
            description: 'The channel to set for notifications.',
            required: true,
            type: ApplicationCommandOptionType.Channel,
        },
        {
            name: 'notification-role',
            description: 'The role to set for notifications.',
            required: true,
            type: ApplicationCommandOptionType.Role,
        }
    ],
    permissionsRequired: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.Administrator],

    callback: async (client, interaction) => {
        const channel = interaction.options.get('notification-channel').value;
        const role = interaction.options.get('notification-role').value;

        const guildIDString = String(interaction.guild.id);
        // console.log(`Channel: ${channel}`);
        // console.log(`This is the guildID ${guildIDString}`);

        const query = {
            guildID: interaction.guild.id,
        }
    
        try {
            //we are returning the first document that matches the query
            const notif = await NotificationChannel.findOne(query);
    
            //If any entries are found by the query
            //this means a notification channel has been set previously
            //it has been set to notify
            //therefore, we should update
            if (notif){
                const document = await NotificationChannel.updateOne({guildID: guildIDString}, 
                    { $set: { channelIDArray: channel, roleIDArray: role} }
                );
                console.log("Existing Row!");
            }
            //This means that there is no notification channel set for this discord guild
            //so we should insert a new row
            else
            {
                const newNotifChannel = new NotificationChannel({
                    guildID: guildIDString, 
                    channelIDArray: channel, 
                    roleIDArray: role
                });

                await newNotifChannel.save();
                console.log("New Row!");
            }

            interaction.reply(`Successfully set the notifications channel to <#${channel}> and the role to notify to <@&${role}>!`);
        } catch(error){
            console.log(`Error with database query for guild and channel ID array: ${error}`);
            interaction.reply(`There was an error with the set-notification-channel command, please contact the developer <@845327968674775061>`);
        }


        // //Model.Update({filter}, {options}, function (err))
        // //upsert: true means to insert if there is a not an existing value to update in the database
        // try {
        //     //this updateOne function sets the channelIDArray and roleIDArray if a document already exists for the current guild
        //     //if a document doesn't exist for the current guild, then we will create a new document with fresh values
        //     //this is done through upsert which is update if existing and insert if not exist
        //     const document = await NotificationChannel.updateOne({guildID: guildIDString}, 
        //             { $set: {guildID: guildIDString, channelIDArray: channel, roleIDArray: role} },
        //             { $setOnInsert: {guildID: guildIDString, channelIDArray: channel, roleIDArray: role} }, 
        //             { upsert: true }
        //         );
            
        //     //bot will send the message like this:
        //     //The channel is 937524513854328852 and the role is <@&927916929853849621>
        //     //we are using <#> because that's the format to mention channels in discord <@&ROLE_ID>
        //     //we are using <@&> because that's the format to mention roles in discord <@&ROLE_ID>
        //     // interaction.reply(`Successfully set the notifications channel to <#${channel}> (${channel}) and the role to notify to <@&${role}> (${role})`);
        //     interaction.reply(`Successfully set the notifications channel to <#${channel}> and the role to notify to <@&${role}>!`);
        // } catch (err) {
        //     console.log(err);

        //     interaction.reply(`There was an error with the set-notification-channel command, please contact the developer <@845327968674775061>`);
        // }

        
    }
}