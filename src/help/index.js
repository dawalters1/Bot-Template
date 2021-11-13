/**
 * Required for intellisense to work with api & command
 * @param {import('@dawalters1/wolf.js').WOLFBot} api
 * @param {import('@dawalters1/wolf.js').CommandObject} command
 */
module.exports = async (api, command) => await api.messaging().sendMessage(command, api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_help_message`));