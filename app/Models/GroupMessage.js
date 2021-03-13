'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class GroupMessage extends Model {

    static get table () {
        return 'group_messages'
    }

}

module.exports = GroupMessage
