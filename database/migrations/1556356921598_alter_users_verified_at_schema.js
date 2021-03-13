'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterUsersVerifiedAtSchema extends Schema {
  up () {
    this.alter('users', (table) => {
      table.date('verified_at').nullable()
    })
  }

  down () {
    this.alter('users', (table) => {
      table.dropColumn('verified_at')
    })
  }
}

module.exports = AlterUsersVerifiedAtSchema
