'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Message extends Model {

    static get table () {
        return 'messages'
    }

}

module.exports = Message
