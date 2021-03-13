'use strict'

const ConnectedUser = use('App/Models/ConnectedUser')
const Message = use('App/Models/Message')

class AnonymousChatController {

  constructor({
    socket,
    auth,
    request
  }) {
    this.socket = socket
    this.request = request
    this.auth = auth
  }

  async onStatus(data) {
    if (data != null && Object.keys(data).length > 0) {

      await ConnectedUser.query().where({
        'user_id': data.user_id,
        'user_type': data.user_type,
        'chat_type': 'anonymous'
      }).update({
        status: data.status,
        socket_id: this.socket.id
      })

    }
  }

  async onTyping(data) {
    // if (data != null && Object.keys(data).length > 0) {
      
      const receiver = await ConnectedUser.query().where({
        'user_id': data.receiver_id,
        'user_type': 'anonymous',
        'chat_type': 'anonymous'
      }).first()

      this.socket.emitTo('typing', {
        typing: data.typing
      }, [receiver.socket_id])

    // }
  }

  async onMessage(data) {
    if (data != null && Object.keys(data).length > 0) {

      const receiver = await ConnectedUser.query().where({
        'user_id': data.receiver_id,
        'user_type': 'anonymous',
        'chat_type': 'anonymous'
      }).first()

      const sentAt = new Date().toJSON().slice(0, 19).replace('T', ' ')

      const message = await Message.create({
        sender_id: data.sender_id,
        sender_type: data.sender_type,
        message: data.message,
        message_type: data.message_type,
        conversation_id: data.conversation_id,
        sent_at: sentAt
      })

      this.socket.emitTo('message', {
        message: message
      }, [receiver.socket_id])

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

module.exports = AnonymousChatController
