'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Reaction extends Model {

  static get table() {
    return 'reactions'
  }

  emoji () {
    return this.belongsTo('App/Models/Emoji').where('type', 'reaction')
  }

}

module.exports = Reaction
