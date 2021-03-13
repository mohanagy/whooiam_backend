'use strict'

const Model = use('Model')

class Word extends Model {
	static get table () {
        return 'words'
    }
}

module.exports = Word
