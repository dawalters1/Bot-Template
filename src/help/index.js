
/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 */
export default async function (client, command, type) {
  return await client.messaging.sendMessage(command, client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_help${type ? `_${type}` : ''}_message`));
}
