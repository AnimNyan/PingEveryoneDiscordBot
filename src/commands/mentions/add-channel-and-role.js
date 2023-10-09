const { ApplicationCommandOptionType, PermissionFlagsBits } = require ('discord.js');
const NotificationChannel = require('../../models/NotificationChannel');
const discordStringFormat = require("../../utils/formatStringForDiscord");

module.exports = {
    name: 'add-channel-and-role',
    description: '(Keeps existing and adds more) Adds a channel and role to be notified.',
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
        let role = interaction.options.get('notification-role').value;

        //check if the role id is @everyone
        //and if it is @everyone then store in the database "@everyone" send "@everyone" instead of "<@&1234567890123>"
        //the reason why we do this is because "<@&1234567890123>"" will send @@everyone 
        //and will not mention people properly, there will be no notification
        //so we need to send the string "@everyone"
        const everyoneRoleID =  interaction.guild.roles.everyone.id;
        //console.log(`everyoneRoleID: ${everyoneRoleID}`);
        //console.log(`role: ${role}`);

        if (role === everyoneRoleID)
        {
            //console.log("Storing @everyone in database");
            //database will now store the string @everyone
            role = "@everyone";
        }

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
                //the .channelIDArray and .roleIDArray are defined in
                //the database Model in the /src/models/NotificationChannel.js file
                //this is how we can reference them with the dot notation
                let channelIDArray = updatedDocument.channelIDArray;
                let roleIDArray = updatedDocument.roleIDArray;
                
                //console.log("channelIDArray:" + channelIDArray);
                
                let channelIDsString = discordStringFormat("channel", channelIDArray);
                let roleIDsString = discordStringFormat("role", roleIDArray);

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