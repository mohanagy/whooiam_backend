'use strict'

class UserLogin {
  get rules () {
    return {
      email: 'required|email',
      password: 'required|min:6|max:20'
    }
  }
  get sanitizationRules () {
    return {
      email: 'normalize_email',
    }
  }
}

module.exports = UserLogin
