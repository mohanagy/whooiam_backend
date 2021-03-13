'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MessagesSchema extends Schema {
  up () {
    this.create('messages', (table) => {
      table.increments()
      table.integer('conversation_id').notNullable()
      table.integer('sender_id').notNullable()
      table.text('message').notNullable()
      table.date('sent_at').nullable()
      table.date('read_at').nullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('messages')
  }
}

module.exports = MessagesSchema
