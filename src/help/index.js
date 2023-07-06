
/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 */
export default async (client, command, type) => await command.reply(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_help${type ? `_${type}` : ''}_message`));
