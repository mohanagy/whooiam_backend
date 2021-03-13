'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterPagesSchema extends Schema {
  up () {
    this.alter('pages', (table) => {
      table.string('description', 255).nullable()
    })
  }

  down () {
    this.alter('pages', (table) => {
      table.dropColumn('description')
    })
  }
}

module.exports = AlterPagesSchema
