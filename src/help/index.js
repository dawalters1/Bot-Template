/**
 * Required for intellisense to work with api & command
 * @param {import('wolf.js').WOLFBot} api
 * @param {import('wolf.js').CommandObject} command
 */
module.exports = async (api, command, type) => await api.messaging().sendMessage(command, api.phrase().getByLanguageAndName(command.language, `${api.options.keyword}_help_${type}_message`));
