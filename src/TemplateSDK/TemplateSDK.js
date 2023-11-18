import config from 'config';
import Mysql2 from 'mysql2/promise';
import Cache from './cache/index.js';
import GameHelper from './helper/GameHelper.js';

class TemplateSDK {
    constructor() {
        const sdkConfig = config.templateSDK;

        if (!sdkConfig) { throw new Error('sdk config missing'); }
        if (!sdkConfig.db) { throw new Error('db missing from config'); }
        const db = sdkConfig.db;
        if (!db.host) { throw new Error('host missing in config'); }
        if (!db.user) { throw new Error('user missing in config'); }
        if (!db.password) { throw new Error('password missing in config'); }
        if (!db.database) { throw new Error('database missing in config'); }

        this.dataSources = {
            db: Mysql2.createPool(
                Object.keys(db).reduce((result, key) => {
                    result[key] = db[key];
                    return result;
                }, {
                    typeCast(field, next) {
                        if (field.type === 'NEWDECIMAL') {
                            const value = field.string();
                            return (value === null) ? null : Number(value);
                        }
                        return next();
                    }
                })
            ),
            cache: new Cache()
        };

        this.game = new GameHelper(this.dataSources);
    }

}

export default TemplateSDK;
