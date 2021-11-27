const validator = require('@dawalters1/wolf.js').Validator;

/**
 * Required for intellisense to work with api & command
 * @param {import('@dawalters1/wolf.js').WOLFBot} api
 * @param {import('@dawalters1/wolf.js').CommandObject} command
 */
module.exports = async (api, command) => {
  const userInput = await command.argument.split(api.SPLIT_REGEX).filter(Boolean)[0];

  const group = await api.group().getById(userInput && validator.isValidNumber(userInput) && parseInt(userInput) > 0 ? parseInt(userInput) : command.targetGroupId);

  if (group.exists) {
    await api.utility().group().getAvatar(group.id, 640).then(async (buffer) => await api.messaging().sendGroupMessage(command.targetGroupId, buffer)).catch(async () => await api.messaging().sendGroupMessage(command.targetGroupId, api.phrase().getByLanguageAndName(command.language, `${api.options.keyword}_group_no_avatar_message`)));

    return await api.messaging().sendGroupMessage(
      command.targetGroupId,
      api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.options.keyword}_group_profile_message`),
        {
          id: group.id,
          name: group.name,
          description: group.description,
          level: group.reputation.toString().split('.')[0],
          percentage: group.reputation.toString().split('.')[1].slice(0, 2) + '.' + group.reputation.toString().split('.')[1].slice(2),
          members: api.utility().number().addCommas(group.members),
          ownerNickname: (await api.subscriber().getById(group.owner.id)).nickname,
          ownerSubscriberId: group.owner.id,
          language: group.extended.language
        }
      )
    );
  }

  return await api.messaging().sendGroupMessage(
    command.targetGroupId,
    api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.options.keyword}_group_profile_error_doesnt_exist_message`),
      {
        nickname: (await api.subscriber().getById(command.sourceSubscriberId)).nickname,
        subscriberId: command.sourceSubscriberId,
        id: group.id
      }
    )
  );
};
