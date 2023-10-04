const { ApplicationCommandOptionType, PermissionFlagsBits } = require ('discord.js');
const NotificationChannel = require('../../models/NotificationChannel');

module.exports = {
    name: 'add-channel-and-role',
    description: 'Adds a channel and role to be notified.',
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
        //console.log(`Channel: ${channel}`);
        //console.log(`This is the guildID ${guildIDString}`);


        //-------------------------MongoDB Queries Start Here-----------------------------
        //----Query #1: To find if there is an existing document for the current discord guild----
        const query = {
            guildID: interaction.guild.id,
        }
        
        try {
            
            //we are returning the first document that matches the query
            const notif = await NotificationChannel.findOne(query);
    
            //If any entries are found by the query
            //this means a notification channel has been set previously
            //it has been set to notify
            //therefore, we should update and push to the arrays
            //$addToSet by default only adds to set if it is not present
            if (notif){
                //----Query #2: To update the existing document for the current discord guild----
                const document = await NotificationChannel.updateOne({guildID: guildIDString}, 
                    { $addToSet: { channelIDArray: channel, roleIDArray: role} }
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



            //----------Query #3: To retrieve the updated document from the database
            //this is for the current discord guild after elements have been added to the document-----------
            const updatedQuery = {
                guildID: interaction.guild.id,
            }

            const updatedDocument = await NotificationChannel.findOne(query);

            //if we found any rows
            //from the query which we should
            if (updatedDocument)
            {
                //declare array variables to be used later
                let roleIDArray = updatedDocument.roleIDArray;
                let channelIDArray = updatedDocument.channelIDArray;

                //console.log("channelIDArray:" + channelIDArray);
                
                //formatting for printing
                //we don't want to print channel or role ids in Discord
                //because that is confusing
                //we want to format it so it is a channel or role instead with Discord's formatting
                let channelIDsString = "";
                for (tempChannelIDString of channelIDArray)
                {
                    //please note the space at the end
                    //which is used to space out different channels and roles
                    tempChannelIDString = `<#${tempChannelIDString}> `;
                    channelIDsString = channelIDsString + tempChannelIDString;
                }


                let roleIDsString = "";
                for (tempRoleIDString of roleIDArray)
                {
                    //please note the space at the end
                    //which is used to space out different channels and roles
                    tempRoleIDString = `<@&${tempRoleIDString}> `;
                    roleIDsString = roleIDsString + tempRoleIDString;
                }

                //console.log(`channelIDsString: ${channelIDsString} roleIDsString: ${roleIDsString}`);

                interaction.reply(`Successfully set the notifications channels to:\n${channelIDsString}\n\nand the roles to notify to:\n${roleIDsString}`);
            }
            else
            {
                interaction.reply(`There was an error with the add-channel-and-role command on getting the updated channels and roles from the databse, please contact the developer <@845327968674775061>`);
            }
        } catch(error){
            console.log(`Error with database query for guild and channel ID: ${error}`);
            interaction.reply(`There was an error with the add-channel-and-role command, please contact the developer <@845327968674775061>`);
        }


        // //Model.Update({filter}, {options}, function (err))
        // //upsert: true means to insert if there is a not an existing value to update in the database
        // try {
        //     //this updateOne function sets the channelID and roleID if a document already exists for the current guild
        //     //if a document doesn't exist for the current guild, then we will create a new document with fresh values
        //     //this is done through upsert which is update if existing and insert if not exist
        //     const document = await NotificationChannel.updateOne({guildID: guildIDString}, 
        //             { $set: {guildID: guildIDString, channelID: channel, roleID: role} },
        //             { $setOnInsert: {guildID: guildIDString, channelID: channel, roleID: role} }, 
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