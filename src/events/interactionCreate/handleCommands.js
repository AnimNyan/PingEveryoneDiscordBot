const { devs, testServer } = require("../../../config.json");
const getLocalCommands = require("../../utils/getLocalCommands");

module.exports = async(client, interaction) => {
  //ignore if it is not a bot command
  if (!interaction.isChatInputCommand()) return;

  const localCommands = getLocalCommands();

  try {
    const commandObject = localCommands.find(
      (cmd) => cmd.name === interaction.commandName
    );

    if (!commandObject) return;

    if(commandObject.devOnly) {
        if (!devs.includes(interaction.member.id)) {
            interaction.reply({
                content: 'Only developers are allowed to run this command.',
                ephemeral: true,
            });
            return;
        }
    }

    if(commandObject.testOnly) {
        if ( !(interaction.guild.id === testServer) ) {
            interaction.reply({
                content: 'This command is a test command only and cannot be ran in this server.',
                ephemeral: true,
            });
            return;
        }
    }

    //if array has any length then loop through array
    //and check if the caller has the correct permissions
    if(commandObject.permissionsRequired?.length){
        for (const permission of commandObject.permissionsRequired) {
            if (!interaction.member.permissions.has(permission)){
                interaction.reply({
                    content: 'Not enough permissions.',
                    ephemeral: true,
                });
                return;
            }
        }
    }


    if(commandObject.botPermissions?.length){
        for (const permission of commandObject.botPermissions) {
            const bot = interaction.guild.members.me;

            if (!bot.permissions.has(permission)){
                interaction.reply({
                    content: "I don't have enough permissions." ,
                    ephemeral: true,
                });
                return;
            }
        }
    }

    await commandObject.callback(client, interaction);
  } catch (error) {
    console.log(`There was an error running this command: ${error}`);
  }
};
