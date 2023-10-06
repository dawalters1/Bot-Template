import GameObject from "../dto/GameObject.js";
import GameSql from "../sql/GameSql.js";
import { Validator } from 'wolf.js'

class GameHelper {
    constructor(dataSources) {
        this._dataSources = dataSources;
    }

    /**
     * Get a game from cache or database by ID
     * @param {number} id - The game ID number
     * @returns {Promise<GameObject>}
     */
    async getById(id) {
        if (Validator.isNullOrUndefined(id)) {
            throw new Error('id cannot be null or undefined');
        } else if (!Validator.isValidNumber(id)) {
            throw new Error('id must be a valid number');
        } else if (Validator.isLessThanOrEqualZero(id)) {
            throw new Error('id cannot be less than or equal to 0');
        }

        const cached = await this._dataSources.cache.getGameById(id);

        if (cached !== null) {

            return JSON.parse(cached);
        }

        const [rows] = await this._dataSources.db.query(
            GameSql.GET_BY_ID,
            [
                id
            ]
        )

        const game = rows.length ? new GameObject(rows[0]) : null;

        await this._dataSources.cache.setGameById(id, game);

        return game;
    }

    /**
     * Get all the game IDs available
     * @returns {Promise<Array<number>>}
     */
    async getGameIdList() {

        const cached = await this._dataSources.cache.getGameIdList();

        if (cached !== null) {
            return cached;
        }

        const [rows] = await this._dataSources.db.query(
            GameSql.GET_GAME_ID_LIST
        )

        const gameIds = rows.length ? rows.map((row) => row.id) : []

        await this._dataSources.cache.setGameById(gameIds);

        return gameIds;
    }

    /**
     * Get all the game IDs available for a specific language
     * @param {string} language - The language
     * @returns {Promise<Array<number>>}
     */
    async getGameIdListByLanguage(language) {
        if (Validator.isNullOrUndefined(language)) {
            throw new Error('language cannot be null or undefined');
        } else if (!Validator.isType(language, 'string')) {
            throw new Error('language must be type of string');
        }

        const cached = await this._dataSources.cache.getGameIdListByLanguage(language);

        if (cached !== null) {
            return cached;
        }

        const [rows] = await this._dataSources.db.query(
            GameSql.GET_GAME_ID_LIST_BY_LANGUAGE,
            [
                language
            ]
        )

        const gameIds = rows.length ? rows.map((row) => row.id) : []

        await this._dataSources.cache.setGameByIdByLanguage(language, gameIds);

        return gameIds;
    }

    /**
     * Get a random game for a language
     * @param {string} language - The language
     * @returns {Promise<GameObject>|Promise<null>} Game object if language is available, null if not
     */
    async getRandomByLanguage(language) {
        if (Validator.isNullOrUndefined(language)) {
            throw new Error('language cannot be null or undefined');
        } else if (!Validator.isType(language, 'string')) {
            throw new Error('language must be type of string');
        }

        await this.getGameIdListByLanguage(language);

        const gameId = await this._dataSources.cache.getRandomGameIdByLanguage(language);

        return gameId ? await this.getById(gameId) : null;
    }

    /**
     * Insert or update a game
     * @param {number|null} id
     * @param {string} language
     * @param {string} word
     * @returns
     */
    async save(id, language, word) {
        if (Validator.isNullOrUndefined(id)) {
            throw new Error('id cannot be null or undefined');
        } else if (!Validator.isValidNumber(id)) {
            throw new Error('id must be a valid number');
        } else if (Validator.isLessThanOrEqualZero(id)) {
            throw new Error('id cannot be less than or equal to 0');
        }
        if (Validator.isNullOrUndefined(language)) {
            throw new Error('language cannot be null or undefined');
        } else if (!Validator.isType(language, 'string')) {
            throw new Error('language must be type of string');
        }
        if (Validator.isNullOrUndefined(word)) {
            throw new Error('word cannot be null or undefined');
        } else if (!Validator.isType(word, 'string')) {
            throw new Error('word must be type of string');
        }

        const gamePrior = id !== null ? await this.getById(id) : null;

        const [queryResults] = await this._dataSources.db.query(
            GameSql.SAVE,
            [
                id,
                language,
                word
            ]
        )

        if (gamePrior) {
            if (gamePrior.language !== language) {
                await Promise.all(
                    [
                        this._dataSources.cache.removeFromGameIdListByLanguage(gamePrior.language, gamePrior.id),
                        this._dataSources.cache.addToGameIdListByLanguage(language, gamePrior.id)
                    ]
                )
            }
        } else {
            await Promise.all(
                [
                    this._dataSources.cache.addToGameIdListByLanguage(language, queryResults.insertId),
                    this._dataSources.cache.addToGameIdList(queryResults.insertId),
                ]
            )
        }

        return queryResults;
    }

    /**
     * Delete a game from the bot
     * @param {number} id
     * @returns
     */
    async deleteById(id) {
        if (Validator.isNullOrUndefined(id)) {
            throw new Error('id cannot be null or undefined');
        } else if (!Validator.isValidNumber(id)) {
            throw new Error('id must be a valid number');
        } else if (Validator.isLessThanOrEqualZero(id)) {
            throw new Error('id cannot be less than or equal to 0');
        }

        const gamePrior = await this.getById(id);

        const [queryResults] = await this._dataSources.db.query(
            GameSql.DELETE_BY_ID,
            [
                id
            ]
        )

        await Promise.all(
            [
                this._dataSources.cache.deleteGameById(id),
                this._dataSources.cache.removeFromGameIdListByLanguage(gamePrior?.language, gamePrior?.id),
                this._dataSources.cache.removeFromGameIdList(gamePrior?.id)
            ]
        )

        return queryResults;
    }
}

export default GameHelper;