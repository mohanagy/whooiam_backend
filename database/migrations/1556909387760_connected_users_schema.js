'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ConnectedUsersSchema extends Schema {
  up () {
    this.create('connected_users', (table) => {
      table.increments()
      table.integer('sender_id').notNullable()
      table.enu('sender_type', ['anonymous', 'normal']).notNullable()
      table.enu('chat_type', ['anonymous', 'direct', 'group']).notNullable()
      table.string('socket_id', 50).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('connected_users')
  }
}

module.exports = ConnectedUsersSchema
