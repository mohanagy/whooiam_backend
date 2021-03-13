'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterUsersSchema extends Schema {
  up () {
    this.alter('users', (table) => {
      table.string('verification_code', 255).nullable()
      table.boolean('status', 1).defaultTo(true)
    })
  }

  down () {
    this.alter('users', (table) => {
      table.dropColumn('verification_code')
      table.dropColumn('status')
    })
  }
}

module.exports = AlterUsersSchema
