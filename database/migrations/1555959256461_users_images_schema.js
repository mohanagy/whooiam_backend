'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UsersImagesSchema extends Schema {
  up () {
    this.create('users_images', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.string('image', 254).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('users_images')
  }
}

module.exports = UsersImagesSchema
