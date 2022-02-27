const validator = require('wolf.js').Validator;
const { Privilege } = require('wolf.js').Constants;

/**
 * Required for intellisense to work with api & command
 * @param {import('wolf.js').WOLFBot} api
 * @param {import('wolf.js').CommandObject} command
 */
module.exports = async (api, command) => {
  // Check to see if the user is authorized, staff or the bot developer
  if (api.config.app.developerId !== command.sourceSubscriberId && !await api.utility().subscriber().privilege().has(command.sourceSubscriberId, Privilege.STAFF) && !await api.authorization().isAuthorized(command.sourceSubscriberId)) {
    return await api.messaging().sendMessage(
      command,
      api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_permission_error_message`),
        {
          nickname: (await api.subscriber().getById(command.sourceSubscriberId)).nickname,
          subscriberId: command.sourceSubscriberId
        }
      )
    );
  }

  if (!command.argument) {
    if (!command.isGroup) {
      return await api.messaging().sendMessage(
        command,
        api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_leave_error_unsupported_message`),
          {
            nickname: (await api.subscriber().getById(command.sourceSubscriberId)).nickname,
            subscriberId: command.sourceSubscriberId
          }
        )
      );
    }

    await api.messaging().sendMessage(
      command,
      api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_leave_message`),
        {
          nickname: (await api.subscriber().getById(command.sourceSubscriberId)).nickname,
          subscriberId: command.sourceSubscriberId
        }
      )
    );

    return await api.group().leaveById(command.targetGroupId);
  }

  const userInput = command.argument.split(api.SPLIT_REGEX).filter(Boolean)[0];

  if (validator.isLessThanOrEqualZero(userInput)) {
    return await api.messaging().sendMessage(
      command,
      api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_leave_error_invalid_group_id_message`),
        {
          nickname: (await api.subscriber().getById(command.sourceSubscriberId)).nickname,
          subscriberId: command.sourceSubscriberId,
          arg: userInput
        }
      )
    );
  }

  const result = await await api.group().leaveById(parseInt(userInput));

  return await api.messaging().sendMessage(
    command,
    api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_leave_${result.success ? 'success' : 'failed'}_message`),
      {
        nickname: (await api.subscriber().getById(command.sourceSubscriberId)).nickname,
        subscriberId: command.sourceSubscriberId,
        reason: result.success ? '' : result.headers && result.headers.message ? result.headers.message : api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_error_unknown_reason_message`)
      }
    )
  );
};
