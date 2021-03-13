'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AnonymousUsersSchema extends Schema {
  up () {
    this.create('anonymous_users', (table) => {
      table.increments()
      table.uuid('uuid').unique().notNullable()
      table.enu('gender', ['male', 'female']).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('anonymous_users')
  }
}

module.exports = AnonymousUsersSchema
