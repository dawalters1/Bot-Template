import { Validator } from 'wolf.js';
import help from '../help/index.js';

/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 */
export default async function (client, command) {
  const joinConfig = client.config.get('join');

  if (!joinConfig.enabled) {
    return await help(client, command);
  }

  if (!command.argument) {
    return await client.messaging.sendMessage(
      command,
      client.utility.string.replace(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_join_error_provide_arguments_message`),
        {
          nickname: (await client.subscriber.getById(command.sourceSubscriberId)).nickname,
          subscriberId: command.sourceSubscriberId
        }
      )
    );
  }

  const args = command.argument.split(client.SPLIT_REGEX).filter(Boolean);

  if (Validator.isLessThanOrEqualZero(args[0])) {
    return await client.messaging.sendMessage(
      command,
      client.utility.string.replace(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_join_error_invalid_group_id_message`),
        {
          nickname: (await client.subscriber.getById(command.sourceSubscriberId)).nickname,
          subscriberId: command.sourceSubscriberId,
          arg: args[0]
        }
      )
    );
  }

  const ownerIdBlacklist = joinConfig.validation.ownerIdBlacklist;

  if (ownerIdBlacklist.includes(command.sourceSubscriberId)) {
    return await client.messaging.sendMessage(
      command,
      client.utility.string.replace(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_join_error_group_owner_banned_message`),
        {
          nickname: (await client.subscriber.getById(command.sourceSubscriberId)).nickname,
          subscriberId: command.sourceSubscriberId
        }
      )
    );
  }

  const { id, owner, members, exists } = await client.group.getById(parseInt(client.utility.number.toEnglishNumbers(args[0])));

  if (!exists) {
    return await client.messaging.sendMessage(
      command,
      client.utility.string.replace(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_join_error_group_doesnt_exist_message`),
        {
          nickname: (await client.subscriber.getById(command.sourceSubscriberId)).nickname,
          subscriberId: command.sourceSubscriberId,
          arg: id
        }
      )
    );
  }

  if (command.sourceSubscriberId !== owner.id) {
    return await client.messaging.sendMessage(
      command,
      client.utility.string.replace(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_join_error_group_owner_only_message`),
        {
          nickname: (await client.subscriber.getById(command.sourceSubscriberId)).nickname,
          subscriberId: command.sourceSubscriberId
        }
      )
    );
  }

  const memberConfig = joinConfig.validation.members;

  if (members < memberConfig.min || members > memberConfig.max) {
    return await client.messaging.sendMessage(
      command,
      client.utility.string.replace(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_join_error_group_requirements_members_too_${members < memberConfig.min ? 'small' : 'large'}_message`),
        {
          nickname: (await client.subscriber.getById(command.sourceSubscriberId)).nickname,
          subscriberId: command.sourceSubscriberId,
          min: client.utility.number.addCommas(memberConfig.min),
          max: client.utility.number.addCommas(memberConfig.max)
        }
      )
    );
  }

  const result = await client.group.joinById(id, args[1]);

  return await client.messaging.sendMessage(
    command,
    client.utility.string.replace(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_join_${result.success ? 'success' : 'failed'}_message`),
      {
        nickname: (await client.subscriber.getById(command.sourceSubscriberId)).nickname,
        subscriberId: command.sourceSubscriberId,
        reason: result.success ? '' : result.headers && result.headers.message ? result.headers.message : client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_error_unknown_reason_message`)
      }
    )
  );
};
