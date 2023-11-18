
export default async (client, message, game, timestamp, cache) => {

    const timeTaken = timestamp - game.startAt;
    const fixedUserString = client.utility.string.sanitise(message.body);
    const fixedAnswer = client.utility.string.sanitise(game.word);

    if (!client.utility.string.isEqual(fixedUserString, fixedAnswer)) {
        return Promise.resolve();
    }

    await Promise.all(
        [
            cache.deleteGame(message.targetChannelId),
            client.utility.timer.cancel(`gameTimeout:${message.targetChannelId}`)
        ]
    )

    return message.reply(
        client.utility.string.replace(
            client.phrase.getByLanguageAndName(game.language, `${client.config.keyword}_game_won_message`),
            {
                nickname: (await message.subscriber()).nickname,
                subscriberId: message.sourceSubscriberId,
                answer: game.word,
                timeTaken: client.utility.toReadableTime(game.language, timeTaken)
            }
        )
    )
}