'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ConversationsSchema extends Schema {
  up () {
    this.create('conversations', (table) => {
      table.increments()
      table.integer('sender_id').notNullable()
      table.enu('sender_type', ['anonymous', 'normal']).notNullable()
      table.integer('receiver_id').notNullable()
      table.enu('receiver_type', ['anonymous', 'normal', 'unknown']).notNullable()
      table.enu('conversation_type', ['direct', 'anonymous', 'group']).notNullable()
      table.date('sent_at').nullable()
      table.date('read_at').nullable()
      table.date('delete_at').nullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('conversations')
  }
}

module.exports = ConversationsSchema
