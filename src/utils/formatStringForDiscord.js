module.exports = (formatType, stringArray) => {
    //formatting for printing
    //we don't want to print channel or role ids in Discord
    //because that is confusing
    //we want to format it so it is a channel or role instead with Discord's formatting
    //initialise string variable to be returned
    let formattedString = "";

    //-------------------------Discord Channel String Formatting-------------------------
    if (formatType === "channel")
    {
        let channelIDsString = "";
        for (tempChannelIDString of stringArray)
        {
            //please note the space at the end
            //which is used to space out different channels and roles
            tempChannelIDString = `<#${tempChannelIDString}> `;
            channelIDsString = channelIDsString + tempChannelIDString;
        }

        //set variable to be returned
        formattedString = channelIDsString;
    }
    //console.log(`channelIDsString: ${channelIDsString} roleIDsString: ${roleIDsString}`);

    
    //-------------------------Discord Role String Formatting-------------------------
    else if (formatType === "role")
    {
        let roleIDsString = "";
        let fullRoleString = "";
        for (tempRoleIDString of stringArray)
        {
            //check if the role id string stored in the database is "@everyone"
            //and if it is "@everyone" then send "@everyone" instead of "<@&1234567890123>"
            //the reason why we do this is because "<@&1234567890123>"" will send @@everyone 
            //and will not mention people properly, there will be no notification
            //so we need to send the string "@everyone"
            if (tempRoleIDString === "@everyone")
            {
                fullRoleString = `@everyone `;
            }
            //else if it is not @everyone then work like normal to mention roles with "<@&role>"
            else
            {
                //please note the space at the end
                //which is used to space out different channels and roles
                fullRoleString = `<@&${tempRoleIDString}> `;
            }
            
            roleIDsString = roleIDsString + fullRoleString;
        }

        //set variable to be returned
        formattedString = roleIDsString;
    }


    //-------------------------Else Catch Invalid String Format-------------------------
    else
    {
        formattedString = "invalid";
        throw new Error(`Invalid formatType: ${formatType}`);
    }


    return formattedString;
};
