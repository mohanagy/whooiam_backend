'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Conversation extends Model {

  static get table() {
    return 'conversations'
  }

  messages() {
    return this.hasMany('App/Models/Message')
  }

}

module.exports = Conversation
