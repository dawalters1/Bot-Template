import { Validator, IconSize } from 'wolf.js';

/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 */
export default async (client, command) => {
    const userInput = command.argument.split(client.SPLIT_REGEX).filter(Boolean)[0];

    const channel = await client.channel.getById(userInput && Validator.isValidNumber(userInput) && parseInt(userInput) > 0 ? parseInt(userInput) : command.targetChannelId);

    if (!channel.exists) {
        return await command.reply(
            client.utility.string.replace(
                client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_channel_profile_error_doesnt_exist_message`),
                {
                    nickname: (await command.subscriber()).nickname,
                    subscriberId: command.sourceSubscriberId,
                    id: channel.id
                }
            )
        );
    }

    await client.utility.channel.avatar(channel.id, IconSize.SMALL)
        .then(async (buffer) => await command.reply(buffer))
        .catch(async () => await command.reply(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_channel_no_avatar_message`)));

    const reputation = channel.reputation.toString().split('.');
    reputation[1] = (reputation[1] ?? '').padEnd(4, '0');

    return await command.reply(
        client.utility.string.replace(
            client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_channel_profile_message`),
            {
                id: channel.id,
                name: channel.name,
                description: channel.description,
                level: reputation[0],
                percentage: `${reputation[1].slice(0, 2)}.${reputation[1].slice(2)}`,
                members: client.utility.number.addCommas(channel.membersCount),
                ownerNickname: (await client.subscriber.getById(channel.owner.id)).nickname,
                ownerSubscriberId: channel.owner.id,
                language: channel.extended.language,
                verificationTier: client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_channel_verification_tier_${channel.verificationTier}`)
            }
        )
    );

};