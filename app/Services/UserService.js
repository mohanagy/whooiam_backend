'use strict'

const Database = use('Database')
const Hash = use('Hash')
const { str_random } = use('App/Helpers')

const User = use('App/Models/User')
const UserUuid = use("App/Models/UserUuid")

class UserService {

  async register(data, auth) {

    // const trx = await Database.beginTransaction()

    const uuid = await this.generateUuid()

    var code = ''
    do {
      code = await str_random(15, 'both')
    } while (await User.query().where('verification_code', code).count() > 0)


    data.password = await Hash.make(data.password)
    data.verification_code = code
    data.uuid = uuid
    if (data.image == null || data.image == "1" || data.image == "2" || data.image == "3" || data.image == "4" || data.image == "5") {
      data.image = "static/assets/img/" + data.gender + "-" + data.image + ".svg"
    } else {
      data.image = "http://graph.facebook.com/" + data.image + "/picture?type=large&width=300&height=300"
    }
    
    const user = await User.create(data)

    const token = await auth.generate(user)

    const userUuid = new UserUuid()
    userUuid.uuid = uuid
    user.uuids().save(userUuid)

    // await trx.commit()

    return {
      user: user,
      token: token
    }
  }

  async generateResetCode(email) {

    var code = ''
    do {
      code = await str_random(15, 'both')
    } while (await User.query().where('reset_code', code).count() > 0)

    await User.query().where('email', email).update({reset_code: code})

    const user = await User.query().where('email', email).first()

    return user
  }

  async createOrUpdateUuid(auth, uuid) {

    try {

      const user = await auth.getUser()
      user.uuid = uuid
      await user.save()

      const userUuid = new UserUuid()
      userUuid.uuid = uuid
      userUuid.user_id = user.id
      await userUuid.save()

    } catch {

      return false

    }

    return true
  }

  async generateUuid() {
    do {
      var uuid = await str_random(10)
    } while (await UserUuid.query().where('uuid', uuid).count() > 0)
    return uuid
  }
}

module.exports = UserService
