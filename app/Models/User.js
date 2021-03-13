'use strict'

const Model = use('Model')
const Hash = use('Hash')

class User extends Model {

  static get table() {
    return 'customers'
  }

  static boot() {
    super.boot()

    // this.addHook('beforeSave', async (userInstance) => {
    //   if (userInstance.dirty.password) {
    //     userInstance.password = await Hash.make(userInstance.password)
    //   }
    // })
  }

  static get dates() {
    return super.dates.concat(['birthdate', 'verified_at'])
  }

  static castDates(field, value) {
    if (field === 'birthdate') {
      return `${value.format('YYYY-MM-DD')}`
    }
    return super.formatDates(field, value)
  }

  static get computed() {
    return ['fullname']
  }

  getFullname({
    firstname,
    lastname
  }) {
    return `${firstname} ${lastname}`
  }

  static get hidden() {
    return ['password']
  }

  tokens() {
    return this.hasMany('App/Models/Token')
  }

  uuids() {
    return this.hasMany('App/Models/UserUuid')
  }

  images() {
    return this.hasMany('App/Models/UserImage')
  }

  reactions() {
    return this.hasMany('App/Models/Reaction')
  }

}

module.exports = User
