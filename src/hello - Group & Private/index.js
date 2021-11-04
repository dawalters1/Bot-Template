/**
 * Required for intellisense to work with api & command
 * @param {import('@dawalters1/wolf.js').WOLFBot} api
 * @param {import('@dawalters1/wolf.js').CommandObject} command
 */
 module.exports = async (api, command) => await api.messaging().sendMessage(command, 
    api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_group_and_private_response_${command.isGroup?'group':'private'}_message`),
    {
        nickname: (await api.subscriber().getById(command.sourceSubscriberId)).nickname,
        subscriberId: command.sourceSubscriberId
    }));
