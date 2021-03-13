'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UsersUuidSchema extends Schema {
  up () {
    this.create('users_uuids', (table) => {
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.uuid('uuid').primary().notNullable()
      table.boolean('status').defaultTo(true)
      table.timestamps()
    })
  }

  down () {
    this.drop('users_uuids')
  }
}

module.exports = UsersUuidSchema
