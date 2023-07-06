/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 */
export default async (client, command, cache) => {

    const unlock = await cache.lock(command.targetChannelId);

    try {
        const cached = await cache.getGame(command.targetChannelId);

        if (cached) {
            return await command.reply(
                client.utility.string.replace(
                    client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_game_start_error_in_progress_message`),
                    {
                        word: cached.word
                    }
                )
            )
        }

        //An example is an example 🤷, even if it is shat.
        const game = {
            language: command.language,
            word: 'example',
            answer: 'e x a m p l e',
            startAt: Date.now()
        };

        await Promise.all(
            [
                cache.setGame(command.targetChannelId, game),
                client.utility.timer.add(
                    `gameTimeout:${command.targetChannelId}`,
                    'gameTimeout',
                    {
                        targetChannelId: command.targetChannelId
                    },
                    client.config.get('game.timeout')
                )
            ]
        )

        return await command.reply(
            client.utility.string.replace(
                client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_game_start_message`),
                {
                    duration: client.utility.toReadableTime(command.language, client.config.get('game.timeout')),
                    word: game.word
                }
            )
        )

    } catch (error) {
        return client.log.error(`error starting game [targetChannelId:${command.targetChannelId}, error:${JSON.stringify(error)}]`)
    } finally {
        unlock();
    }
}