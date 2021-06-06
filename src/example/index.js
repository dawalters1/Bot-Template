
module.exports = async (api, command)=>{
    
    const subscriber = await api.subscriber().getById(command.sourceSubscriberId);
    
    return await bot.messaging().sendGroupMessage(command.targetGroupId, 
        bot.utility().string().replace(bot.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_example_message`),
        {
            nickname: subscriber.nickname,
            subscriberId: subscriber.id
        }));
}