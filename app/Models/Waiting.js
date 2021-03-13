'use strict'

const Model = use('Model')
const Hash = use('Hash')

class Waiting extends Model {

  static get table() {
    return 'waiting'
  }

  static boot() {
    super.boot()
  }

}

module.exports = User
