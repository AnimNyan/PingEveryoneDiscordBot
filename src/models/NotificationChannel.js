const {Schema, model } = require('mongoose');

/*
Example of the documents:
{
  _id: "5db579f5faf1f8434098f7f5"
  GuildID: "927916929853849621",
  ChannelIDs: ["5db57a03faf1f8434098f7f8", "687234910f8434098f7f9" ]
  RoleIDs: [ "293dfsm32k35msdp12389", "158mvd38mj3923h3158293476" ],
}
*/

const notificationChannelSchema = new Schema({
    guildID: {
        type: String,
        required: true,
    },
    channelIDArray: {
        type: [String],
        required: true,
    },
    roleIDArray: {
        type: [String],
        required: true,
    }
});

module.exports = model('NotificationChannel', notificationChannelSchema);