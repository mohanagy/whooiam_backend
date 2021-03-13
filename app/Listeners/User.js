'use strict'

const User = (exports = module.exports = {})
const Mail = use("Mail")
const Config = use('Config')

User.activateEmail = async user => {
  return await Mail.send('emails.activate-email', user, (message) => {
    const appEmail = Config.get('app.email')
    message
      .to(user.user.email)
      .from(appEmail)
      .subject('تفعيل البريد الإلكتروني')
  })
}

User.forgotPassword = async user => {
  return await Mail.send('emails.restore-password', user, (message) => {
    const appEmail = Config.get('app.email')
    message
      .to(user.user.email)
      .from(appEmail)
      .subject('استرجاع كلمة المرور')
  })
}
