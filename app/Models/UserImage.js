'use strict'

const Model = use('Model')

class UserImage extends Model {

    static get table () {
        return 'users_images'
    }

    user () {
        return this.belongsTo('App/Models/User')
    }

}

module.exports = UserImage
