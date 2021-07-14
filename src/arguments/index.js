
module.exports = async (api, command) => {
    
    if(!command.argument){
        return await bot.messaging().sendGroupMessage(command.targetGroupId, 
            bot.utility().string().replace(bot.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_get_arguments_error_provide_arguments_message`),
            {
                nickname: (await api.subscriber().getById(command.sourceSubscriberId)).nickname,
                subscriberId: command.sourceSubscriberId
            }));
    }

    const args = command.argument.split(/[\n\t,،\s+]/g).filter(Boolean);

    return await bot.messaging().sendGroupMessage(command.targetGroupId, 
        bot.utility().string().replace(bot.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_argument_message`),
        {
            argCount: api.utility().number().addCommas(args.length),
            args: args.join(', ')
        }));
}