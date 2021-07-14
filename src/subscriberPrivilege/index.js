const {capability, privilege} = require('@dawalters1/constants');

const multiplePrivileges = [privilege.ALPHA_TESTER, privilege.BOT_TESTER, privilege.CONTENT_SUBMITTER,  privilege.VOLUNTEER];

module.exports = async (api, command) => {
    const subscriber = await api.subscriber().getById(command.sourceSubscriberId);
    
    //#region  Check if user has single privilege
    if(await api.utility().privilege().has(command.sourceSubscriberId, privilege.STAFF)){
        return await api.messaging().sendGroupMessage(command.targetGroupId, 
            api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_has_privilege_staff_message`),
            {
                nickname: subscriber.nickname,
                subscriberId: subscriber.id,
            }));
    }

    //#endregion

    //#region Check to see if a user has many (returns true apon 1 located)
    else if(await api.utility().privilege().has(command.sourceSubscriberId, multiplePrivileges)){
        const privilege = multiplePrivileges.find((priv)=> await api.utility().privilege().has(command.sourceSubscriberId, priv));
        return await api.messaging().sendGroupMessage(command.targetGroupId, 
            api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_has_privilege_${privilege.toString()}_message`),
            {
                nickname: subscriber.nickname,
                subscriberId: subscriber.id
            }));
    }
    else{
        return await api.messaging().sendGroupMessage(command.targetGroupId, 
            api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_not_privileged_message`),
            {
                nickname: subscriber.nickname,
                subscriberId: subscriber.id
            }));
        }
}