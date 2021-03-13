'use strict'

class UserEditProfile {
  get rules () {
    let userId = this.ctx.auth.user.id
    return {
      firstname: 'required|min:3',
      lastname: 'required|min:3',
      email: `required|email|unique:customers,email,id,${userId}`,
      mobile: `required|min:9|unique:customers,mobile,id,${userId}`,
      gender: 'required|in:male,female',
      birthdate: 'required',
    }
  }
}

module.exports = UserEditProfile
