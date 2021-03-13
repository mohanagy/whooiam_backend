'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class ConversationReaction extends Model {

  	static get table() {
    	return 'conversations_reactions'
  	}

	emoji () {
    	return this.belongsTo('App/Models/Emoji', 'reaction_id').where('type', 'reaction')
  	}

}

module.exports = ConversationReaction
