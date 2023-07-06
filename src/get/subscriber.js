import { Validator } from 'wolf.js';
import { IconSize, Language } from 'wolf.js/src/constants/index.js';

/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 */
export default async (client, command) => {
    const userInput = command.argument.split(client.SPLIT_REGEX).filter(Boolean)[0];

    const subscriber = await client.subscriber.getById(userInput && Validator.isValidNumber(userInput) && parseInt(userInput) > 0 ? parseInt(userInput) : command.sourceSubscriberId);

    if (!subscriber.exists) {
        return await command.reply(
            client.utility.string.replace(
                client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_subscriber_profile_error_doesnt_exist_message`),
                {
                    nickname: (await command.subscriber()).nickname,
                    subscriberId: command.sourceSubscriberId,
                    id: subscriber.id
                }
            )
        );
    }

    await client.utility.subscriber.avatar(subscriber.id, IconSize.SMALL)
        .then(async (buffer) => await command.reply(buffer))
        .catch(async () => await command.reply(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_subscriber_no_avatar_message`)));

    return await command.reply(
        client.utility.string.replace(
            client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_subscriber_profile_message`),
            {
                id: subscriber.id,
                nickname: subscriber.nickname,
                charm: subscriber.charms.selectedList?.length > 0
                    ? client.utility.string.replace(
                        client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_charm_selected_message`),
                        {
                            name: (await client.charm.getById(subscriber.charms.selectedList[0].charmId, Language.ENGLISH)).name,
                            id: subscriber.charms.selectedList[0].charmId
                        }
                    )
                    : client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_none`),
                status: subscriber.status,
                level: subscriber.reputation.toString().split('.')[0],
                percentage: subscriber.reputation.toString().split('.')[1].slice(0, 2) + '.' + subscriber.reputation.toString().split('.')[1].slice(0, 2),
                onlineState: client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_onlineState_${subscriber.onlineState}`),
                deviceType: client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_deviceType_${subscriber.deviceType}`),
                gender: client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_gender_${subscriber.extended.gender}`),
                relationship: client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_relationship_${subscriber.extended.gender}`),
                lookingFor: client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_lookingFor_${subscriber.extended.gender}`),
                language: client.utility.toLanguageKey(subscriber.extended.language)
            }
        )
    );
}
