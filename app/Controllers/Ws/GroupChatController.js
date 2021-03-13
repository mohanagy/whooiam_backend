'use strict'

const { str_random } = use('App/Helpers')
const { sanitize } = use('Validator')
const Database = use('Database')

const ConnectedUser = use('App/Models/ConnectedUser')
const GroupMessage = use('App/Models/GroupMessage')
const User = use('App/Models/User')
const AnonymousUser = use('App/Models/AnonymousUser')
const Block = use('App/Models/Block')
const Word = use('App/Models/Word')

class GroupChatController {

  constructor ({ socket, auth, request }) {
    this.socket = socket
    this.request = request
    this.auth = auth
  }

  async onStatus(data) {
    // if (data != null && Object.keys(data).length > 0) {

      await ConnectedUser.query().where({
        'user_id': data.user_id,
        'user_type': data.user_type,
        'chat_type': 'group'
      }).update({
        status: data.status,
        socket_id: this.socket.id
      })

    // }
  }

  async onTyping(data) {
      this.socket.broadcast('typing:' + data.country, {
        typing: data.typing
      })
  }

  async onMessage(plainData) {
    if (plainData != null) {

      const sentAt = new Date()

      const data = sanitize(plainData, { message: 'strip_tags' })

      var sender = {}
      if (data.sender_type == 'normal') {
        sender = await User.query().select(['id', Database.raw("CONCAT(firstname, ' ', lastname) as name"), 'image']).where('id', data.sender_id).first()
        sender.user_type = 'normal'
      } else {
        sender = await AnonymousUser.query().select(['id', 'name', 'image']).where('id', data.sender_id).first()
        sender.user_type = 'anonymous'
      }

      // BLOCK OFFENSIVE WORDS
      var wordsList = []
      if (data.message.indexOf(' ') !== -1) {
      wordsList = data.message.split(" ")
      } else {
        wordsList = [data.message]
      }

      var conditions = []
      for (var i = 0; i < wordsList.length; i++) {
        conditions[i] = "`name` = ?"
      }
      const statement = conditions.join(" OR ")

      const availabeWords = await Word.query().whereRaw(statement, wordsList).getCount()
      this.socket.broadcast('unblocked:' + data.country, {
        availabeWords: availabeWords
      })

      if(availabeWords > 0) {
        await Block.create({
          ip: this.request.ip(),
          duration: 10
        })
      }

      const availableIp = await Block.query().where('ip', this.request.ip()).getCount()
      if (availableIp > 0) {
        this.socket.broadcastToAll('blocked:' + data.country, {
          message: 'لقد تم حظرك من الدخول للمحادثة مؤقتا لاستخدامك ألفاظا غير لائقة',
          sender: sender
        })
        return
      }
		  // END OF BLOCKING

      const message = await GroupMessage.create({
        sender_id: data.sender_id,
        sender_type: data.sender_type,
        country: data.country,
        message: data.message,
        message_type: data.message_type == 'text' ? 'text' : 'image',
        sent_at: sentAt,
        sender_ip: this.request.ip()
      })

      this.socket.broadcast('message:' + data.country, {
        message: message,
        sender: sender
      })

    }
  }

  onClose(data) {
    if (data != null && Object.keys(data).length > 0) {
      // await ConnectedUser.query().where({
      //   'user_id': data.user_id,
      //   'user_type': data.user_type,
      //   'chat_type': 'anonymous'
      // }).update({
      //   status: 'offline',
      //   socket_id: null
      // })
    }
  }

}

module.exports = GroupChatController
