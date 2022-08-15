const help = require('../../src/help');
const validator = require('wolf.js').Validator;

/**
 * Required for intellisense to work with api & command
 * @param {import('wolf.js').WOLFBot} api
 * @param {import('wolf.js').CommandObject} command
 */
module.exports = async (api, command) => {
  const joinConfig = api.config.get('join');

  if (!joinConfig.enabled) {
    return await help(api, command);
  }

  if (!command.argument) {
    return await api.messaging().sendMessage(
      command,
      api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_join_error_provide_arguments_message`),
        {
          nickname: (await api.subscriber().getById(command.sourceSubscriberId)).nickname,
          subscriberId: command.sourceSubscriberId
        }
      )
    );
  }

  const args = command.argument.split(api.SPLIT_REGEX).filter(Boolean);

  if (validator.isLessThanOrEqualZero(args[0])) {
    return await api.messaging().sendMessage(
      command,
      api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_join_error_invalid_group_id_message`),
        {
          nickname: (await api.subscriber().getById(command.sourceSubscriberId)).nickname,
          subscriberId: command.sourceSubscriberId,
          arg: args[0]
        }
      )
    );
  }

  const ownerIdBlacklist = joinConfig.validation.ownerIdBlacklist;

  if (ownerIdBlacklist.includes(command.sourceSubscriberId)) {
    return await api.messaging().sendMessage(
      command,
      api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_join_error_group_owner_banned_message`),
        {
          nickname: (await api.subscriber().getById(command.sourceSubscriberId)).nickname,
          subscriberId: command.sourceSubscriberId
        }
      )
    );
  }

  const { id, owner, members, exists } = await api.group().getById(parseInt(api.utility().number().toEnglishNumbers(args[0])));

  if (!exists) {
    return await api.messaging().sendMessage(
      command,
      api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_join_error_group_doesnt_exist_message`),
        {
          nickname: (await api.subscriber().getById(command.sourceSubscriberId)).nickname,
          subscriberId: command.sourceSubscriberId,
          arg: id
        }
      )
    );
  }

  if (command.sourceSubscriberId !== owner.id) {
    return await api.messaging().sendMessage(
      command,
      api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_join_error_group_owner_only_message`),
        {
          nickname: (await api.subscriber().getById(command.sourceSubscriberId)).nickname,
          subscriberId: command.sourceSubscriberId
        }
      )
    );
  }

  const memberConfig = joinConfig.validation.members;

  if (members < memberConfig.min || members > memberConfig.max) {
    return await api.messaging().sendMessage(
      command,
      api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_join_error_group_requirements_members_too_${members < memberConfig.min ? 'small' : 'large'}_message`),
        {
          nickname: (await api.subscriber().getById(command.sourceSubscriberId)).nickname,
          subscriberId: command.sourceSubscriberId,
          min: api.utility().number().addCommas(memberConfig.min),
          max: api.utility().number().addCommas(memberConfig.max)
        }
      )
    );
  }

  const result = await api.group().joinById(id, args[1]);

  return await api.messaging().sendMessage(
    command,
    api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_join_${result.success ? 'success' : 'failed'}_message`),
      {
        nickname: (await api.subscriber().getById(command.sourceSubscriberId)).nickname,
        subscriberId: command.sourceSubscriberId,
        reason: result.success ? '' : result.headers && result.headers.message ? result.headers.message : api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_error_unknown_reason_message`)
      }
    )
  );
};
