
export default async (client, data, cache) => {

    const unlock = await cache.lock(data.targetChannelId);

    try {
        const cached = await cache.getGame(data.targetChannelId);

        if (!cached) {
            return Promise.resolve();
        }

        await cache.deleteGame(data.targetChannelId);

        return await client.messaging.sendGroupMessage(
            data.targetChannelId,
            client.utility.string.replace(
                client.phrase.getByLanguageAndName(cached.language, `${client.config.keyword}_game_timeout_message`),
                {
                    word: cached.answer
                }
            )
        )
    }
    finally {
        unlock();
    }
}