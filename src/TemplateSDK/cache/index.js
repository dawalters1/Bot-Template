import Redis from 'ioredis';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

//#region Lua Scripts

const saddifexists = fs.readFileSync(path.resolve(__dirname, 'lua/saddifexists.lua', 'utf8'));
const smembersifexists = fs.readFileSync(path.resolve(__dirname, 'lua/smembersifexists.lua', 'utf8'));
const sreplace = fs.readFileSync(path.resolve(__dirname, 'lua/sreplace.lua', 'utf8'));

//#endregion

// eslint-disable-next-line no-unused-vars
const TIME_ONE_SECOND = 1;
const TIME_THREE_SECONDS = 3;
const TIME_FIVE_SECONDS = 5;
const TIME_15_SECONDS = 15;
const TIME_ONE_HOUR = 3600;
const TIME_ONE_DAY = TIME_ONE_HOUR * 24;
const TIME_ONE_WEEK = TIME_ONE_DAY * 7;

class Cache {
    constructor(config) {
        const clonedConfig = JSON.parse(JSON.stringify(config.redis));

        clonedConfig.retryStrategy = (times) => Math.min(times * 100, 3000);

        this.client = new Redis(clonedConfig);

        this.lock = promisify(redisLock(this._client));

        this.client.defineCommand(
            'saddifexists',
            {
                numberOfKeys: 1,
                lua: saddifexists,
            }
        );

        this.client.defineCommand(
            'sreplace',
            {
                numberOfKeys: 1,
                lua: sreplace,
            }
        );

        this.client.defineCommand(
            'smembersifexists',
            {
                numberOfKeys: 1,
                lua: smembersifexists,
            }
        );
    }

    //#region Private Methods
    _get(key) {
        return new Promise((resolve, reject) => {
            this._client.get(
                `${KEY_PREFIX}${key}`,
                (error, results) => ((error) ? reject(error) : resolve(results))
            );
        });
    }

    _set(key, item, ttl) {
        // Item needs to expire
        if (ttl) {
            return new Promise((resolve, reject) => {
                this._client.set(
                    `${KEY_PREFIX}${key}`,
                    item,
                    'EX',
                    ttl,
                    (error, results) => ((error) ? reject(error) : resolve(results))
                );
            });
        }

        // Item is perm
        return new Promise((resolve, reject) => {
            this._client.set(
                `${KEY_PREFIX}${key}`,
                item,
                (error, results) => ((error) ? reject(error) : resolve(results))
            );
        });
    }

    _delete(key) {
        return new Promise((resolve, reject) => {
            this._client.del(
                `${KEY_PREFIX}${key}`,
                (error, results) => ((error) ? reject(error) : resolve(results))
            );
        });
    }

    _exists(key) {
        return new Promise((resolve, reject) => {
            this._client.exists(
                `${KEY_PREFIX}${key}`,
                (error, results) => ((error) ? reject(error) : resolve(results))
            );
        });
    }

    _sadd(key, item, replace = false) {
        return new Promise((resolve, reject) => {
            this._client[replace ? 'sreplace' : 'saddifexists'](
                `${KEY_PREFIX}${key}`,
                item,
                (error, results) => ((error) ? reject(error) : resolve(results))
            );
        });
    }

    _srem(key, item) {
        return new Promise((resolve, reject) => {
            this._client.srem(
                `${KEY_PREFIX}${key}`,
                item,
                (error, results) => ((error) ? reject(error) : resolve(results))
            );
        });
    }

    _smem(key) {
        return new Promise((resolve, reject) => {
            this._client.smembersifexists(
                `${KEY_PREFIX}${key}`,
                (error, results) => ((error) ? reject(error) : resolve(results))
            );
        });
    }
    _srandmember(key) {
        return new Promise((resolve, reject) => {
            this.client.srandmember(
                key,
                (error, results) => ((error) ? reject(error) : resolve(results)),
            );
        });
    }
    //#endregion

    /**
     * Get a game object from cache by ID
     * @param {number} id
     * @returns {string|null} Stringified game or null if no result
     */
    async getGameById(id) {
        return await this._get(`game:${id}`);
    }
    /**
     * Sets a game object in cache by ID
     * @param {number} id
     * @param {GameObject} value
     * @returns {number}
     */
    async setGameById(id, value) {
        return await this._set(`game:${id}`, JSON.stringify(value), TIME_ONE_WEEK);
    }
    /**
     * Deletes a game object in cache by ID
     * @param {number} id
     * @returns {number}
     */
    async deleteGameById(id) {
        return await this._delete(`game:${id}`)
    }

    /**
     * Gets all game IDs from cache
     * @returns {Array<number>}
     */
    async getGameIdList() {
        return (await this._smem('game.id.list'))?.map((gameId) => parseInt(gameId));
    }
    /**
     * Sets the game ID list in cache
     * @param {Array<number>} values
     * @returns {number}
     */
    async setGameIdList(values) {
        return await this._sadd('game.id.list', values, true);
    }
    /**
     * Adds IDs to the game ID list
     * @param {number|Array<number>} values
     * @returns {number}
     */
    async addToGameIdList(values) {
        return await this._sadd('game.id.list', Array.isArray(values) ? values : [values]);
    }
    /**
     * Removes IDs from the game ID list
     * @param {number|Array<number>} values
     * @returns {number}
     */
    async removeFromGameIdList(values) {
        return await this._srem('game.id.list', Array.isArray(values) ? values : [values]);
    }
    /**
     * Delete the game ID list from cache
     * @returns {number}
     */
    async deleteGameIdList() {
        return await this._delete('game.id.list')
    }
    /**
     * Get a random ID from the game ID list
     * @returns {number|null}
     */
    async getRandomGameId() {
        return await this._srandmember('game.id.list')
    }

    /**
     * Get a game ID list by language
     * @param {string} language
     * @returns
     */
    async getGameIdListByLanguage(language) {
        return await this._smem(`game.id.list.language:${language}`);
    }
    /**
     * Sets the game ID list by language
     * @param {string} language
     * @param {number|array<number>} values
     * @returns {number}
     */
    async setGameIdListByLanguage(language, values) {
        return await this._sadd(`game.id.list.language:${language}`, Array.isArray(values) ? values : [values], true);
    }
    /**
     * Adds IDs to the game ID list by language
     * @param {string} language
     * @param {number|array<number>} values
     * @returns {number}
     */
    async addToGameIdListByLanguage(language, values) {
        return await this._sadd(`game.id.list.language:${language}`, Array.isArray(values) ? values : [values]);
    }
    /**
     * Deletse IDs from the game ID list by language
     * @param {string} language
     * @param {number|array<number>} values
     * @returns {number}
     */
    async removeFromGameIdListByLanguage(language, values) {
        return await this._srem(`game.id.list.language:${language}`, Array.isArray(values) ? values : [values]);
    }
    /**
     * Deletes the game ID list by language
     * @param {string} language
     * @returns {number}
     */
    async deleteGameIdListByLanguage(language) {
        return await this._delete(`game.id.list.language:${language}`)
    }
    /**
     * Get a random ID from game ID list by language
     * @param {string} language
     * @returns {number|null}
     */
    async getRandomGameIdByLanguage(language) {
        return await this._srandmember(`game.id.list.language:${language}`)
    }
}

export default Cache;