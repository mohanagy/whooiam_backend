'use strict'

const ConnectedUser = use('App/Models/ConnectedUser')
const Message = use('App/Models/Message')
const AnonymousUser = use('App/Models/AnonymousUser')
const User = use('App/Models/User')
const Conversation = use('App/Models/Conversation')
const ConversationReaction = use('App/Models/ConversationReaction')
const Reaction = use('App/Models/Reaction')
const Emoji = use('App/Models/Emoji')

class DirectChatController {

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
    // if (data != null && Object.keys(data).length > 0) {
      await ConnectedUser.query().where({
        'user_id': data.user_id,
        'user_type': data.user_type,
        'chat_type': 'direct'
      }).update({
        status: data.status,
        socket_id: this.socket.id
      })

    // }
  }

  async onTyping(data) {
    // if (Object.keys(data).length > 0) {

      var user = {}
      if (data.receiver_type == 'normal') {
        user = await User.query().where('id', data.receiver_id).first()
      } else {
        user = await AnonymousUser.query().where('id', data.receiver_id).first()
      }

      // if (user != null) {
        const receiver = await ConnectedUser.query().where({
          'user_id':  data.receiver_id,
          'user_type': data.receiver_type,
          'chat_type': 'direct'
        }).first()

        this.socket.emitTo('typing', {
          typing: data.typing,
          user_type: data.sender_type,
          user_id: data.sender_id,
        }, [receiver.socket_id])
      // }

    // }
  }

  async onReaction(data) {
    if (data != null && Object.keys(data).length > 0) {

      var user = {}
      if (data.receiver_type == 'normal') {
        user = await User.query().where('id', data.receiver_id).first()
      } else {
        user = await AnonymousUser.query().where('id', data.receiver_id).first()
      }

      if (user != null) {

        const receiver = await ConnectedUser.query().where({
          'user_id':  data.receiver_id,
          'user_type': data.receiver_type,
          'chat_type': 'direct'
        }).first()

        const conversationReactionCount = await ConversationReaction.query().where({
          'conversation_id': data.conversation_id,
          'user_id': data.receiver_id,
          'user_type': data.receiver_type,
        }).getCount()

        if (conversationReactionCount == 0) {
          await ConversationReaction.create({
            'conversation_id': data.conversation_id,
            'user_id': data.receiver_id,
            'user_type': data.receiver_type,
            'reaction_id': data.reaction_id
          })

          if (data.receiver_type == 'normal') {
            const reaction = await Reaction.query().where({
              'user_id': data.receiver_id,
              'emoji_id': data.reaction_id
            }).first()

            if (reaction == null) {
              await Reaction.create({
                'user_id': data.receiver_id,
                'emoji_id': data.reaction_id,
                'count': 1
              })
            } else {
              reaction.count = reaction.count + 1
              await reaction.save()
            }
          }
        }

        const emoji = await Emoji.query().where('id', data.reaction_id).first()

        this.socket.emitTo('reaction', {
          reaction_id: data.reaction_id,
          emoji: emoji,
          user_type: data.sender_type,
          user_id: data.sender_id
        }, [receiver.socket_id])

      }

    }
  }

  async onMessage(data) {
    if (data != null && Object.keys(data).length > 0) {

      var user = {}
      if (data.receiver_type == 'normal') {
        user = await User.query().where('id', data.receiver_id).first()
      } else {
        user = await AnonymousUser.query().where('id', data.receiver_id).first()
      }

      // const user = await User.query().where('uuid', data.receiver_uuid).first()

      if (user != null) {

        const receiver = await ConnectedUser.query().where({
          'user_id':  data.receiver_id,
          'user_type': data.receiver_type,
          'chat_type': 'direct'
        }).first()

        const sentAt = new Date()//.toJSON()

        const message = await Message.create({
          message: data.message,
          message_type: data.message_type,
          sender_id: data.sender_id,
          sender_type: data.sender_type,
          conversation_id: data.conversation_id,
          sent_at: sentAt
        })

        if (Object.keys(receiver).length > 0) {
          var sender_name = ''
          if (data.sender_type == 'normal') {
            const sender = await User.query().where('id', data.sender_id).first()
            sender_name = sender.firstname + ' ' + sender.lastname
          } else {
            const sender = await AnonymousUser.query().where('id', data.sender_id).first()
            sender_name = sender.name
          }
          this.socket.emitTo('message', {
            message: message,
            sender_name: sender_name,
            user_type: data.sender_type,
            user_id: data.sender_id
          }, [receiver.socket_id])
        }

      }

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

module.exports = DirectChatController
