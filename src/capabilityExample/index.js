const {capability} = require('@dawalters1/constants');

module.exports = async (bot, command)=>{
    
    if(!await bot.utility().groupMemberCapability().check(command.targetGroupId, command.sourceSubscriberId, capability.MOD)){
        return await bot.messaging().sendGroupMessage(command.targetGroupId, 
            bot.utility().replaceInString(bot.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_error_privilege_mod`),
            {
                nickname: subscriber.nickname,
                subscriberId: subscriber.id
            }));
    }
    
    const subscriber = await bot.subscriber().getById(command.sourceSubscriberId);
    
    return await bot.messaging().sendGroupMessage(command.targetGroupId, 
        bot.utility().replaceInString(bot.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_example_message`),
        {
            nickname: subscriber.nickname,
            subscriberId: subscriber.id
        }));
}