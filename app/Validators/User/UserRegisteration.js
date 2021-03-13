'use strict'

class UserRegisteration {
  get rules () {
    return {
      firstname: 'required|min:3',
      lastname: 'required|min:3',
      email: 'required|email|unique:customers',
      password: 'required|min:6|max:20'
    }
  }
  get sanitizationRules () {
    return {
      email: 'normalize_email',
    }
  }
}

module.exports = UserRegisteration
