'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PagesSchema extends Schema {
  up () {
    this.create('pages', (table) => {
      table.increments()
      table.string('key').notNullable().unique()
      table.string('title').notNullable()
      table.text('details').notNullable()
      table.boolean('status', 1).defaultTo(true)
      table.timestamps()
    })
  }

  down () {
    this.drop('pages')
  }
}

module.exports = PagesSchema
