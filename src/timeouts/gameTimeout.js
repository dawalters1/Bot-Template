
export default async (client, data, cache) => {

    const unlock = await cache.lock(`game:${data.targetChannelId}`);

    try {
        const cached = await cache.getGame(data.targetChannelId);

        if (!cached) { return false; }

        await cache.deleteGame(data.targetChannelId);

        return await client.messaging.sendGroupMessage(
            data.targetChannelId,
            client.utility.string.replace(
                client.phrase.getByLanguageAndName(cached.language, `${client.config.keyword}_game_timeout_message`),
                {
                    word: cached.word
                }
            )
        )
    }
    finally {
        unlock();
    }
}