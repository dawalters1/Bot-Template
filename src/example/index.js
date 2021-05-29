
module.exports = async (bot, command)=>{
    
    const subscriber = await bot.subscriber().getById(command.sourceSubscriberId);
    
    return await bot.messaging().sendGroupMessage(command.targetGroupId, 
        bot.utility().replaceInString(bot.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_example_message`),
        {
            nickname: subscriber.nickname,
            subscriberId: subscriber.id
        }));
}