'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class AnonymousUser extends Model {

    static get table () {
        return 'anonymous_users'
    }

}

module.exports = AnonymousUser
