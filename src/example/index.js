
module.exports = async (api, command)=> 
await bot.messaging().sendGroupMessage(command.targetGroupId, 
    bot.utility().string().replace(bot.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_example_message`),
    {
        nickname: (await api.subscriber().getById(command.sourceSubscriberId)).nickname,
        subscriberId: command.sourceSubscriberId
    }));
