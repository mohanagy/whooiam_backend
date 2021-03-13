'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class ConnectedUser extends Model {

    static get table () {
        return 'connected_users'
    }

}

module.exports = ConnectedUser
