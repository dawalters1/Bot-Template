
/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 */
export default async (client, command) => await command.reply(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_help_message`));
