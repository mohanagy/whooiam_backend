'use strict'

class UserForgotPassword {
  get rules () {
    return {
      email: 'required|email',
    }
  }
}

module.exports = UserForgotPassword
