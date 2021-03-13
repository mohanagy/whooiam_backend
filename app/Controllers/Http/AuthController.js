'use strict'

/*
* Modules
*/
const Event = use("Event")
const Hash = use('Hash')

/*
* Models
*/
const User = use("App/Models/User")
const UserService = use('App/Services/UserService')

class AuthController {

  constructor() {
    this.userService = new UserService
  }

  async loginFacebook ({ response, ally }) {
    const url = await ally.driver('facebook').getRedirectUrl()
    return response.status(200).json({
      url: url
    })
  }

  async loginTwitter ({ response, ally }) {
    const url = await ally.driver('twitter').getRedirectUrl()
    return response.status(200).json({
      url: url
    })
  }

  async facebookCallback ({ ally, auth }) {
    try {
      const fbUser = await ally.driver('facebook').getUser()

      // user details to be saved
      const userDetails = {
        email: fbUser.getEmail(),
        token: fbUser.getAccessToken(),
        login_source: 'facebook'
      }

      // search for existing user
      const whereClause = {
        email: fbUser.getEmail()
      }

      const user = await User.findOrCreate(whereClause, userDetails)
      await auth.login(user)

      return 'Logged in'
    } catch (error) {
      return 'Unable to authenticate. Try again later'
    }
  }

  async twitterCallback ({ ally, auth }) {
    try {
      const fbUser = await ally.driver('twitter').getUser()

      // user details to be saved
      const userDetails = {
        email: fbUser.getEmail(),
        token: fbUser.getAccessToken(),
        login_source: 'facebook'
      }

      // search for existing user
      const whereClause = {
        email: fbUser.getEmail()
      }

      const user = await User.findOrCreate(whereClause, userDetails)
      await auth.login(user)

      return 'Logged in'
    } catch (error) {
      return 'Unable to authenticate. Try again later'
    }
  }

  async register({ request, auth, response }) {

    // try {
      const data = await this.userService.register(request.all(), auth)
      Event.fire("user::activate-email", {
        user: data.user
      })

      return response.json({
        status: 'success',
        data: data.token
      })
    // } catch (error) {

      return response.status(400).json({
        status: 'error',
        message: 'حدثت مشكلة أثناء إنشاء الحساب، يرجى المحاولة فيما بعد.'
      })
    // }
  }

  async login({ request, auth, response }) {

    try {

      let {email, password} = request.all()
      const token = await auth.attempt(email, password)
      const user = await User.query().where('email', email).first()

      return response.json({
        status: 'success',
        data: token,
        user: user
      })

    } catch (error) {

      response.status(400).json({
        status: 'error',
        message: 'اسم المستخدم أو كلمة المرور خاطئة'
      })

    }

  }

  async forgotPassword({ request, response }) {

    const email = request.input('email')

    const user = await this.userService.generateResetCode(email)

    Event.fire("user::forgot-password", {
      user: user
    })

    return response.json({
      status: 'success',
      message: 'ٍتهانينا! تم إعادة تغيير كلمة المرور بنجاح',
    })

  }

  async resetPassword({ request, response }) {

    const code = request.input('code')
    var password = await Hash.make(request.input('password'))

    if (password == '') {
      return response.json({
        status: 'success',
        message: 'يرجى إدخال كلمة المرور الجديدة'
      })
    }

    if (code != '') {

      await User.query().where('reset_code', code).update({password: password, reset_code: ''})

      return response.json({
        status: 'success',
        message: 'ٍتهانينا! تم إعادة تغيير كلمة المرور بنجاح'
      })
    } else {
      return response.json({
        status: 'success',
        message: 'كود التفعيل خاطيء'
      })
    }
  }

  async activateEmail({ request, response }) {

    const verificationCode = request.input('verification_code')

    if (verificationCode == '') {
      return response.json({
        status: 'success',
        message: 'يرجى إدخال رمز التفعيل'
      })
    }

    const verifiedAt = new Date().toJSON().slice(0, 10)

    let user = await User.query().where('verification_code', verificationCode).first()
    if (user != null && Object.keys(user).length > 0) {
      user.verification_code = null
      user.verified_at = verifiedAt
      user.save()
    }

    return response.json({
      status: 'success',
      user: user,
      message: 'شكرًا لك لتفعيلك البريد الإلكتروني، يمكنك الاستفادة الآن من كافة الخدمات المتاحة.'
    })

  }

}

module.exports = AuthController
