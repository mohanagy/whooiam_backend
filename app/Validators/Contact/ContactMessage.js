'use strict'

class ContactMessage {
  get rules () {
    return {
      name: 'required',
      title: 'required',
      message: 'required',
    }
  }
}

module.exports = ContactMessage
