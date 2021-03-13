'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterAnonymousUsersSchema extends Schema {
  up () {
    this.alter('anonymous_users', (table) => {
      table.string('name', 255).nullable()
    })
  }

  down () {
    this.alter('anonymous_users', (table) => {
      table.dropColumn('name')
    })
  }
}

module.exports = AlterAnonymousUsersSchema
