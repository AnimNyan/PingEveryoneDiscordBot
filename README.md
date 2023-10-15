# PingEveryoneDiscordBot

## Discord
First things first, I have a discord server for questions, support and bugs find me here: https://discord.gg/JkNp3mnJ6Q

You can find me on discord with the username **@animenyan** and message my username directly as well.

## What does PingEveryoneDiscordBot do?
PingEveryoneDiscordBot is a discord bot made with NodeJS. Discord has a strict limit of maximum 10 people per group chat. What happens if you go above that? Well you have to create a server. However, a server does not give push notifications for messages. This bot allows you to set multiple channels and channels. When a user message is sent on a channel set for the bot, the bot will mention the role (usually @everyone).

This means everyone gets push notifications from messages. It comes with a Command and Event Handler for which full credit goes to Under Ctrl.

## How does it do it?
When you use the /add-channel-and-role or /set-notification-channel slash commands, the Discord bot is sending queries to a mongodb database, either mongodb atlas (cloud) or otherwise. It will record the channels to listen for messages and the roles to mention in case there is a message in the set channels. 

Now once it receives a message, it will check by making a database query to mongodb if the channel was set to be listened to, if so it will ping the roles (usually @everyone). It will also change the server nickname for the bot to the last user message's username and also send the message again for Desktop Notifications, so other people can easily see who the message is from and what they said.

## Credits
Thank you to Under Ctrl for the Advanced Command + Event Handler which is used for this code here: https://www.youtube.com/watch?v=JEEcbVjLyr0
The only minor modifications were to use the following line in src/utils/getApplicationCommands.js:
```
module.exports = async (client) => {
    let applicationCommands = await client.application.commands;
```

and the following line in src/events/ready/01registerCommands.js:
```
const applicationCommands = await getApplicationCommands(client);
```

This is so the discord bot works in all servers.

## Usage:
To use the bot, please use the following steps:
1. git clone this repository from the https url.

2. Go to the Discord Developer portal here: https://discord.com/developers/applications > Create a new app > invite the bot to your server.

3. Create a ".env" file following the .env example file replacing the values for your bot and server id.

4. Please install npm and nodejs on your computer and then change directory into the folder you pulled from github and run the following command:
```
npm install
```
This will install all the npm dependencies from the pakcage.json.

5. If you're using a server to run this, please install pm2 as per the following documentation: https://www.letscloud.io/community/how-to-use-pm2-to-setup-a-nodejs-production and then you can use this command:
```
pm2 start src/index.js
```

If you just want to run it for testing purposes feel free to use node or nodemon like so:
```
node src/index.js
nodemon src/index.js
```