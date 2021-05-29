
module.exports = async (bot, command)=>
{ 
    await bot.messaging().sendGroupMessage(command.targetGroupId, bot.phrase().getByLanguageAndName(command.language, `${bot.config.keyword}_help_message`));
}