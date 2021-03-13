'use strict'

const Model = use('Model')
const Hash = use('Hash')

class ConnectedAnonymous extends Model {

  static get table() {
    return 'connected_anonymous'
  }

  static boot() {
    super.boot()
  }

}

module.exports = ConnectedAnonymous
