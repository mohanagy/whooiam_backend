'use strict'

const Model = use('Model')

class Block extends Model {
	static get table () {
        return 'blocks'
    }
}

module.exports = Block
