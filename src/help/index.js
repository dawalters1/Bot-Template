
module.exports = async (api, command)=>
{ 
    await api.messaging().sendGroupMessage(command.targetGroupId, api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_help_message`));
}