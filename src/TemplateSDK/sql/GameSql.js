export const GET_BY_ID = `SELECT id, language, word, created_at, updated_at FROM game
    WHERE id = ?;`;

export const GET_GAME_ID_LIST = `SELECT id FROM game`

export const GET_GAME_ID_LIST_BY_LANGUAGE = `SELECT id FROM game
    WHERE language = ?`

export const SAVE = `INSERT INTO game (id, language, word) VALUES (?, ?, ?) as gm
    ON DUPLICATE KEY UPDATE
        language = gm.language,
        word = gm.word;`;

export const DELETE_BY_ID = `DELETE FROM game
    WHERE id = ?;`

export default {
    GET_BY_ID,
    GET_GAME_ID_LIST,
    GET_GAME_ID_LIST_BY_LANGUAGE,
    SAVE,
    DELETE_BY_ID
}