/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {*} param1
 * @param {*} templateSDK
 * @param {*} cache
 * @param {*} fromAutoplay - Not implemented in this template.
 * @returns
 */
const startGame = async (client, { targetChannelId, language }, templateSDK, cache, fromAutoplay = false) => {

    const game = await templateSDK.game.getRandomByLanguage(language);

    if (!game) {
        return await client.messaging.sendChannelMessage(
            targetChannelId,
            client.phrase.getByLanguageAndName(language, `${client.config.keyword}_start_error_no_game_available_message`)
        )
    }

    const delay = fromAutoplay ? 0 : client.config.get('game.autoplayDelay');

    await Promise.all(
        [
            cache.setGame(
                targetChannelId,
                {
                    word: game.word,
                    language,
                    startedAt: Date.now() + delay,
                },
                client.config.get('game.backupCacheTTL')
            ),
            client.utility.timer.add(
                `gameTimeout:${targetChannelId}`,
                'gameTimeout',
                {
                    targetChannelId
                },
                client.config.get('game.timeout') + delay
            )
        ]
    )

    if (delay) {
        await client.utility.delay(delay);
    }

    return await client.messaging.sendChannelMessage(
        targetChannelId,
        client.utility.string.replace(
            client.phrase.getByLanguageAndName(language, `${client.config.keyword}_game_message`),
            {
                word: game.word.split('').join(' '),
            }
        )
    )
}

const handleCommand = async (client, command, templateSDK, cache) => {
    const unlock = await cache.lock(`game:${command.targetChannelId}`);

    try {
        const cached = await cache.getGame(command.targetChannelId);

        if (cached) {
            return await command.reply(
                client.utility.string.replace(
                    client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_game_start_error_in_progress_message`),
                    {
                        word: game.word.split('').join(' '),
                    }
                )
            )
        }

        return await startGame(client, command, templateSDK, cache);

    } catch (error) {
        return client.log.error(`error starting game [targetChannelId:${command.targetChannelId}][error:${JSON.stringify(error)}]`)
    } finally {
        unlock();
    }
}

const exports = {
    startGame,
    handleCommand
}

export {
    startGame,
    handleCommand,

    exports as default
}

