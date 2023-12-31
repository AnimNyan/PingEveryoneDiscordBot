const {Client, Message } = require('discord.js');
const NotificationChannel = require('../../models/NotificationChannel');
const discordStringFormat = require("../../utils/formatStringForDiscord");

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
            //declare array variables to be used later
            //.roleIDArray is defined in
            //the database Model in the /src/models/NotificationChannel.js file
            //this is how we can reference them with the dot notation
            let roleIDArray = notif.roleIDArray;
            
            let roleIDsString = discordStringFormat("role", roleIDArray);
            
            //Change nickname on the server to match the user that sent the message 
            //This is so that when the ping from the discord bot
            //appears as a desktop notification on Discord
            //it shows you the displayName of the person who sent the message
            //I have confirmed this works

            //we are using .displayName 
            //according to these docs here: https://old.discordjs.dev/#/docs/discord.js/main/class/User?scrollTo=displayName
            //The global name of this user, or their username if they don't have one
            //please note the display name is not the server nickname it is just the Global/Username which shows on your profile
            let botUser = message.guild.members.cache.get(client.user.id);
            let botUserNickname = botUser.nickname;
            let userDisplayName = message.author.displayName;
            
            //only set the username if it is different from what it is currently
            //this prevents setting the username when it doesn't need to be set
            if (botUserNickname != userDisplayName)
            {
                // console.log(`Username is different! botUserNickname:${botUserNickname} === userDisplayName:${userDisplayName}`);
                // message.channel.send(`Username is different! botUserNickname:${botUserNickname} === userDisplayName:${userDisplayName}`);
                await botUser.setNickname(userDisplayName);
            }

            // else if (botUserNickname === userDisplayName)
            // {
            //     console.log(`Username is the same! botUserNickname:${botUserNickname} === userDisplayName:${userDisplayName}`);
            //     message.channel.send(`Username is the same! botUserNickname:${botUserNickname} === userDisplayName:${userDisplayName}`);
            // }
            
            //change the nickname of the bot to the user who just spoke
            // await client.user.setNickname(message.author.displayName);

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