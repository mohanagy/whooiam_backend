'use strict'

const Model = use('Model')

class UserUuid extends Model {

    static get table () {
        return 'users_uuids'
    }

}

module.exports = UserUuid
