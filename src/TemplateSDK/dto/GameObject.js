import { Validator } from 'wolf.js';

class GameObject {
    constructor(object) {
        if (Validator.isNullOrUndefined(object.id)) {
            throw new Error('id cannot be null or undefined');
        } else if (!Validator.isValidNumber(object.id)) {
            throw new Error('id must be a valid number');
        } else if (Validator.isLessThanOrEqualZero(object.id)) {
            throw new Error('id cannot be less than or equal to 0');
        }
        if (Validator.isNullOrUndefined(object.language)) {
            throw new Error('language cannot be null or undefined');
        } else if (!Validator.isType(object.language, 'string')) {
            throw new Error('language must be type of string');
        }
        if (Validator.isNullOrUndefined(object.word)) {
            throw new Error('word cannot be null or undefined');
        } else if (!Validator.isType(object.word, 'string')) {
            throw new Error('word must be type of string');
        }

        this.id = object.id;
        this.language = object.language;
        this.word = object.word;
        this.createdAt = (object.created_at instanceof Date) ? object.created_at.toISOString() : object.created_at;
        this.updatedAt = (object.updated_at instanceof Date) ? object.updated_at.toISOString() : object.updated_at;
    }
}

export default GameObject;