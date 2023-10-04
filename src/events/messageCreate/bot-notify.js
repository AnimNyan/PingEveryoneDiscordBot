const {Client, Message } = require('discord.js');
const NotificationChannel = require('../../models/NotificationChannel');

/**
 * 
 * @param {Client} client 
 * @param {Message} message 
 */

module.exports = async (client, message) => {
    //if the message is not a message in the server
    //or if it is a message by a bot ignore it
    if (!message.inGuild() || message.author.bot) return;

    const guildIDString = message.guild.id;
    const channelIDString = message.channel.id;
    // console.log(`guildIDString: ${guildIDString}`);
    // console.log(`channelIDString: ${channelIDString}`);

    const query = {
        $and: [ 
            { guildID: guildIDString },
            //this allows for any document to be returned that includes the channel id in it's array
            {channelIDArray: { $all: [channelIDString] } } 
        ]
    }

    try {
        //we are returning the first document that matches the query
        const notif = await NotificationChannel.findOne(query);

        //If any entries are found by the query
        //this means that the user message was put in a channel where
        //it has been set to notify
        //therefore, a notification ping message should be made by the bot
        if (notif){
            let roleIDArray = notif.roleIDArray;

            //formatting for printing
            //we don't want to print channel or role ids in Discord
            //because that is confusing
            //we want to format it so it is a channel or role instead with Discord's formatting
            let roleIDsString = "";
            for (tempRoleIDString of roleIDArray)
            {
                //please note the space at the end
                //which is used to space out different channels and roles
                tempRoleIDString = `<@&${tempRoleIDString}> `;
                roleIDsString = roleIDsString + tempRoleIDString;
            }
            //console.log(message.author.displayName);
            await client.guilds.cache.get(message.guild.id).me.setNickname(message.author.displayName);
            
            //change the nickname of the bot to the user who just spoke
            // await client.user.setNickname(message.author.displayName);
z
            //console.log(`channelIDsString: ${channelIDsString} roleIDsString`);
            
            //const notifMessage = `${message.content} \n\n<@&${notif.roleIDArray}> (${notif.roleIDArray})`; 
            const notifMessage = `${message.content} \n\n${roleIDsString}`; 
            //If a user sends a message then ping everyone
            //and then delete the message afterwards in 1ms
            //so it doesn't interrupt the flow of conversation
            message.reply(notifMessage).then(sentMessage => {
                sentMessage.delete(1);
            });
        }
    } catch(error){
        console.log(`Error with database query for guild and channel ID: ${error}`);
        message.reply(`There was an error with the bot-notify command, please contact the developer <@845327968674775061>`);
    }
}