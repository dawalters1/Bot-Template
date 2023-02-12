/* eslint-disable no-unused-vars */
import Redis from 'ioredis';
import config from 'config';
import redisLock from 'redis-lock';
import { promisify } from 'util'
// #region DEFAULT TIMES

// eslint-disable-next-line no-unused-vars
const TIME_ONE_SECOND = 1;
const TIME_THREE_SECONDS = 3;
const TIME_FIVE_SECONDS = 5;
const TIME_15_SECONDS = 15;
const TIME_ONE_HOUR = 3600;
const TIME_ONE_DAY = TIME_ONE_HOUR * 24;
const TIME_ONE_WEEK = TIME_ONE_DAY * 7;

// #endregion

// #region KEYs

const KEY_PREFIX = 'template.';
const GAME_PREFIX = 'game:';

// #endregion

class Cache {
    constructor() {
        const clonedConfig = JSON.parse(JSON.stringify(config.redis));

        clonedConfig.retryStrategy = (times) => Math.min(times * 100, 3000);

        this._client = new Redis(clonedConfig);

        this.lock = promisify(redisLock(this._client));
    }

    // #region Private Methods

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

    _expire(key, ttl) {
        return new Promise((resolve, reject) => {
            this._client.expire(
                `${KEY_PREFIX}${key}`,
                ttl,
                (error, results) => ((error) ? reject(error) : resolve(results))
            );
        });
    }

    _ttl(key) {
        return new Promise((resolve, reject) => {
            this._client.ttl(
                `${KEY_PREFIX}${key}`,
                (error, results) => ((error) ? reject(error) : resolve(results))
            );
        });
    }


    async getGame(id) {
        return JSON.parse(await this._get(`${GAME_PREFIX}${id}`));
    }

    async setGame(id, value) {
        return await this._set(`${GAME_PREFIX}${id}`, JSON.stringify(value));
    }

    async deleteGame(id) {
        return await this._delete(`${GAME_PREFIX}${id}`);
    }
}

export default Cache;