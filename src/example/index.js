
module.exports = async (api, command)=>{
    
    const subscriber = await api.subscriber().getById(command.sourceSubscriberId);
    
    return await api.messaging().sendGroupMessage(command.targetGroupId, 
        api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_example_message`),
        {
            nickname: subscriber.nickname,
            subscriberId: subscriber.id
        }));
}
