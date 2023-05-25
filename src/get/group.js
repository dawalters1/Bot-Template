import { Validator, IconSize } from 'wolf.js';

/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 */
export default async (client, command) => {
    const userInput = command.argument.split(client.SPLIT_REGEX).filter(Boolean)[0];

    const group = await client.group.getById(userInput && Validator.isValidNumber(userInput) && parseInt(userInput) > 0 ? parseInt(userInput) : command.targetGroupId);

    if (!group.exists) {
        return await command.reply(
            client.utility.string.replace(
                client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_group_profile_error_doesnt_exist_message`),
                {
                    nickname: (await command.subscriber()).nickname,
                    subscriberId: command.sourceSubscriberId,
                    id: group.id
                }
            )
        );
    }

    await client.utility.group.avatar(group.id, IconSize.SMALL)
        .then(async (buffer) => await command.reply(buffer))
        .catch(async () => await command.reply(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_group_no_avatar_message`)));

    return await command.reply(
        client.utility.string.replace(
            client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_group_profile_message`),
            {
                id: group.id,
                name: group.name,
                description: group.description,
                level: group.reputation.toString().split('.')[0],
                percentage: group.reputation.toString().split('.')[1].slice(0, 2) + '.' + group.reputation.toString().split('.')[1].slice(2),
                members: client.utility.number.addCommas(group.membersCount),
                ownerNickname: (await client.subscriber.getById(group.owner.id)).nickname,
                ownerSubscriberId: group.owner.id,
                language: group.extended.language
            }
        )
    );

};