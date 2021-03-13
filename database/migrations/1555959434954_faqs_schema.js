'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class FaqsSchema extends Schema {
  up () {
    this.create('faqs', (table) => {
      table.increments()
      table.string('title').notNullable()
      table.text('details').notNullable()
      table.boolean('status', 1).defaultTo(true)
      table.timestamps()
    })
  }

  down () {
    this.drop('faqs')
  }
}

module.exports = FaqsSchema
