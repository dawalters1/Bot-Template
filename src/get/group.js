import { Validator } from 'wolf.js';
import { IconSize } from 'wolf.js/src/constants/index.js';

/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 */
export default async function (client, command) {
  const userInput = command.argument.split(client.SPLIT_REGEX).filter(Boolean)[0];

  const group = await client.group.getById(userInput && Validator.isValidNumber(userInput) && parseInt(userInput) > 0 ? parseInt(userInput) : command.targetGroupId);

  if (group.exists) {
    /*
    Not Deployed to production
    await client.utility.group.avatar(group.id, IconSize.SMALL)
      .then(async (buffer) => await client.messaging.sendGroupMessage(command.targetGroupId, buffer))
      .catch(async () => await client.messaging.sendGroupMessage(command.targetGroupId, client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_group_no_avatar_message`)));
    */

    return await client.messaging.sendGroupMessage(
      command.targetGroupId,
      client.utility.string.replace(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_group_profile_message`),
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
  }

  return await client.messaging.sendGroupMessage(
    command.targetGroupId,
    client.utility.string.replace(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_group_profile_error_doesnt_exist_message`),
      {
        nickname: (await client.subscriber.getById(command.sourceSubscriberId)).nickname,
        subscriberId: command.sourceSubscriberId,
        id: group.id
      }
    )
  );
};
