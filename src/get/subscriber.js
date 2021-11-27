const validator = require('@dawalters1/wolf.js').Validator;
const { Language } = require('@dawalters1/wolf.js').Constants;

/**
 * Required for intellisense to work with api & command
 * @param {import('@dawalters1/wolf.js').WOLFBot} api
 * @param {import('@dawalters1/wolf.js').CommandObject} command
 */
module.exports = async (api, command) => {
  const userInput = await command.argument.split(api.SPLIT_REGEX).filter(Boolean)[0];

  const subscriber = await api.subscriber().getById(userInput && validator.isValidNumber(userInput) && parseInt(userInput) > 0 ? parseInt(userInput) : command.sourceSubscriberId);

  if (subscriber.exists) {
    await api.utility().subscriber().getAvatar(subscriber.id, 640).then(async (buffer) => await api.messaging().sendGroupMessage(command.targetGroupId, buffer)).catch(async () => await api.messaging().sendGroupMessage(command.targetGroupId, api.phrase().getByLanguageAndName(command.language, `${api.options.keyword}_subscriber_no_avatar_message`)));

    return await api.messaging().sendGroupMessage(
      command.targetGroupId,
      api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.options.keyword}_subscriber_profile_message`),
        {
          id: subscriber.id,
          nickname: subscriber.nickname,
          charm: subscriber.charms.selectedList.length > 0
            ? api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.options.keyword}_charm_selected_message`),
              {
                name: (await api.charm().getById(subscriber.charms.selectedList[0].charmId, Language.ENGLISH)).name,
                id: subscriber.charms.selectedList[0].charmId
              })
            : api.phrase().getByLanguageAndName(command.language, `${api.options.keyword}_none`),
          status: subscriber.status,
          level: subscriber.reputation.toString().split('.')[0],
          percentage: subscriber.reputation.toString().split('.')[1].slice(0, 2) + '.' + subscriber.reputation.toString().split('.')[1].slice(0, 2),
          onlineState: subscriber.onlineState || api.phrase().getByLanguageAndName(command.language, `${api.options.keyword}_unknown`),
          deviceType: subscriber.deviceType || api.phrase().getByLanguageAndName(command.language, `${api.options.keyword}_unknown`),
          gender: subscriber.extended.gender || api.phrase().getByLanguageAndName(command.language, `${api.options.keyword}_not_specified`),
          relationship: subscriber.extended.relationship || api.phrase().getByLanguageAndName(command.language, `${api.options.keyword}_not_specified`),
          lookingFor: subscriber.extended.lookingFor || api.phrase().getByLanguageAndName(command.language, `${api.options.keyword}_not_specified`),
          language: subscriber.extended.language || api.phrase().getByLanguageAndName(command.language, `${api.options.keyword}_not_specified`)
        }
      )
    );
  }

  return await api.messaging().sendGroupMessage(
    command.targetGroupId,
    api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.options.keyword}_subscriber_profile_error_doesnt_exist_message`),
      {
        nickname: (await api.subscriber().getById(command.sourceSubscriberId)).nickname,
        subscriberId: command.sourceSubscriberId,
        id: subscriber.id
      }
    )
  );
};
