
module.exports = async (api, command) => await api.messaging().sendMessage(command, api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_help_message`));