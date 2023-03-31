
export default async (client, data, cache) => {

    const unlock = await cache.lock(data.targetGroupId);

    try {
        const cached = await cache.getGame(data.targetGroupId);

        if (!cached) {
            return Promise.resolve();
        }

        await cache.deleteGame(data.targetGroupId);

        return await client.messaging.sendGroupMessage(
            data.targetGroupId,
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