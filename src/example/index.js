/**
 * Required for intellisense to work with api & command
 * @param {import('@dawalters1/wolf.js').WOLFBot} api
 * @param {import('@dawalters1/wolf.js').CommandObject} command
 */
module.exports = async (api, command) => 
    await api.messaging().sendGroupMessage(command.targetGroupId, 
        api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_example_message`),
        {
            nickname: (await api.subscriber().getById(command.sourceSubscriberId)).nickname,
            subscriberId: command.sourceSubscriberId
        }));
