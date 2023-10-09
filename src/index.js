require('dotenv').config();

const { Client, IntentsBitField} = require('discord.js');
const mongoose = require('mongoose');
const eventHandler = require('./handlers/eventHandler');

const client = new Client ({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
    allowedMentions: {parse: ["everyone", "roles", "users"], repliedUser: true}
});

(async () => {
    try {
        eventHandler(client);
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB.");

        
    } catch (error) {
        console.log(`Error: ${error}`);
    }
})();

client.login(process.env.TOKEN);

// client.on('ready', (c) => {
//     console.log(`${c.user.tag} is online.`);
// });

// client.on('messageCreate', (message)=> {
//     //console.log(message);

//     //ignore bot messages
//     if (message.author.bot) {
//         // do nothing
//         console.log('Ignoring bot message!');
//         return;
//     }
    
//     //If a user sends a message then ping everyone
//     //and then delete the message afterwards in 1ms
//     //so it doesn't interrupt the flow of conversation
//     message.reply("@everyone").then(sentMessage => {
//         sentMessage.delete(1);
//     });
// });

// client.on('interactionCreate', (interaction) => {
//     //if it is not a slash command ignore it
//     if (!interaction.isChatInputCommand()) return;

//     //console.log(interaction.commandName);
//     if (interaction.commandName === "add") {
//         const num1 = interaction.options.get('first-number').value;
//         const num2 = interaction.options.get('second-number').value;

//         //console.log(num1);
//         interaction.reply(`The sum is ${num1 + num2}`);
//     }
// });

// client.login(process.env.TOKEN);

//add ability to set a channel to listen to and to set a role