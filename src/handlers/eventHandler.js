const path = require('path');
const getAllFiles = require("../utils/getAllFiles");

module.exports = (client) => {
    const eventFolders = getAllFiles(path.join(__dirname, '..', 'events'), true);

    for (const eventFolder of eventFolders) {
        const eventFiles = getAllFiles(eventFolder);

        //so that there is order when executing the files which is done alphabetically
        eventFiles.sort((a, b) => a > b);

        const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();

        client.on(eventName, async (arg) => {
            for (const eventFile of eventFiles){
                const eventFunction = require(eventFile);
                await eventFunction(client, arg);
            }
        })
    }
};
