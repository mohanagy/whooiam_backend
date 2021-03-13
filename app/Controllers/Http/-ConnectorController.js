'use strict'

const User = use('App/Models/User')
const Database = use('Database')
const Message = use('App/Models/Message')
const Conversation = use('App/Models/Conversation')
const ConnectedUser = use('App/Models/ConnectedUser')
const AnonymousUser = use('App/Models/AnonymousUser')
const GroupMessage = use('App/Models/GroupMessage')
const ConversationReaction = use('App/Models/ConversationReaction')
const {
  str_random
} = use('App/Helpers')

const perpage = 15

class ConnectorController {

  /**
   * Insert "normal|authenticated" user to connected user list, or update it's status if created
   * @param {request} param0
   * @param {response} param1
   */
  async connectAuth({
    request,
    response,
    auth
  }) {

    const user = await auth.getUser()
    const chatType = request.input('chatType')

    const normal = await ConnectedUser.query().where('user_type', 'normal').where('user_id', user.id).where('chat_type', chatType).first()
    if (normal == null || Object.keys(normal).length <= 0) {
      await ConnectedUser.create({
        user_id: user.id,
        user_type: 'normal',
        chat_type: chatType,
        socket_id: null,
        conversation_id: null,
        status: 'online'
      })
    } else {
      await ConnectedUser.query().where('user_type', 'normal').where('user_id', user.id).where('chat_type', chatType).update({
        status: 'online'
      })
    }

    return response.status(200).json({
      status: 'success',
      message: ''
    })

  }

  /**
   * Insert "anonymous" user to connected user list, or update it's status to "online" if created
   * @param {request} param0
   * @param {response} param1
   */
  async connectAnonymous({
    request,
    response
  }) {

    var gender = request.input('gender')
    const imageId = request.input('image_id')
    const uuid = request.input('uuid')
    var nickname = request.input('nickname')
    const chatType = request.input('chatType')
    var image = ''

    var user = null
    if (uuid != null) {
      user = await AnonymousUser.query().where('uuid', '=', uuid).first()
    }

    if (nickname == '' || nickname == null) {
      const randomNumber = await str_random(2)
      nickname = "مجهول - " + randomNumber
    }

    if (gender != '' && gender != null) {
      image = 'static/assets/img/' + gender + '-' + imageId + '.svg'
    }

    if (user == null || chatType == 'group' || chatType == 'anonymous') {
      const newUUID = await str_random(20)
      user = await AnonymousUser.create({
        uuid: newUUID,
        gender: gender,
        image: image,
        name: nickname
      })
    } else {
      user.name = nickname
      user.gender = gender
      user.image = image
      await user.save()
    }

    let connected = await ConnectedUser.query().where('user_id', user.id)
      .where('user_type', 'anonymous')
      .where('chat_type', chatType).first()
    if (connected == null) {
      await ConnectedUser.create({
        user_id: user.id,
        user_type: 'anonymous',
        chat_type: chatType,
        socket_id: null,
        conversation_id: null,
        status: 'online'
      })
    }

    return response.status(200).json({
      status: 'success',
      user: user
    })

  }

  async setOffline({request}) {
    const anonymousUuid = request.input('anonymous_uuid')
    const senderAnonymous = await AnonymousUser.query().where('uuid', anonymousUuid).first()
    if(senderAnonymous != null && senderAnonymous != undefined) {
      const connected = await ConnectedUser.query().where('user_id', senderAnonymous.id).first()
      connected.status = 'offline'
      connected.socket_id = null
      await connected.save()
    }
  }

  async getSender({
    request,
    response,
    auth
  }) {

    const anonymousUuid = request.input('anonymous_uuid')
    const senderType = request.input('sender_type')

    var user = {}
    if (senderType == 'normal') {
      user = await auth.getUser()
      user.name = user.firstname + ' ' + user.lastname
      user.user_type = 'normal'
    } else {
      user = await AnonymousUser.query().where('uuid', anonymousUuid).first()
      user.fullname = user.name
      user.user_type = 'anonymous'
    }

    return response.status(200).json({
      status: 'success',
      user: user
    })

  }

  async findReceiver({ request, response, auth }){
    const anonymousUuid = request.input('anonymous_uuid')
    const receiverUuid = request.input('receiver_uuid')

    var user = null
    if (receiverUuid != null) {
      user = await AnonymousUser.query().where('uuid', receiverUuid).first()
      // const connected = await ConnectedUser.query().where('id', '!=', sender.id).where('socket_id', '!=', null).where('status', '=', 'online').whereNull('conversation_id').orderByRaw('RAND()').first()
      // if (connected != null) {
      //   user = await AnonymousUser.query().where('id', connected.user_id).first()
      // }
    } else {

      const senderAnonymous = await AnonymousUser.query().where('uuid', anonymousUuid).first()

      const sender = await ConnectedUser.query().where({
        user_id: senderAnonymous.id,
        user_type: 'anonymous',
        chat_type: 'anonymous'
      }).first()

      if (sender != null) {
        const users = await Conversation.query().where({'sender_id': sender.id, 'sender_type': 'anonymous'}).pluck('sender_id')

        // return response.status(200).json({
        //   status: 'success',
        //   users: users
        // })

        const connected = await ConnectedUser.query().where('chat_type', 'anonymous').where('socket_id', '!=', '').where('status', '=', 'online').pluck('user_id')

        if (users.length > 0) {
          for (var i = 0; i < connected.length; i++) {
            const currrent = connected[i]
            if(!users.includes(currrent) && currrent != sender.user_id) {
              user = await AnonymousUser.query().where('id', connected).first()
              break;
            }
          }
        } else {
          if (connected.length > 0) {
            for (var i = 0; i < connected.length; i++) {
              const currrent = connected[i]
              if(currrent != sender.user_id) {
                user = await AnonymousUser.query().where('id', currrent).first()
                break;
              }
            }
          }
        }
      }
    }

    if (user != null) {
      return response.status(200).json({
        status: 'success',
        user: user
      })
    } else {
      return response.status(400).json({
        status: 'info',
        message: 'لا تتوفر حاليا أطراف محادثة نشطة'
      })
    }
  }

  /**
   * Search for available user to chat with him
   * @param {request} param0
   * @param {response} param1
   * @param {auth} param2
   */
  async initAnonymousChat({
    request,
    response,
    auth
  }) {

    const senderId = request.input('sender_id')
    const senderType = request.input('sender_type')
    const receiverId = request.input('receiver_id')
    const receiverType = request.input('receiver_type')
    const conversationUuid = request.input('conversation_uuid')
    const anonymousUuid = request.input('anonymous_uuid')

    if (anonymousUuid == null) {
      return response.status(400).json({
        status: 'error',
        message: 'يجب أن تقوم بالتسجيل كمجهول من خلال الصفحة الرئيسية'
      })
    }

    var conversation = null
    var messages = {}

    if (conversation == null) {

      conversation = await Conversation.query().where({
        sender_id: senderId,
        sender_type: 'anonymous',
        receiver_id: receiverId,
        receiver_type: 'anonymous',
        conversation_type: 'anonymous',
      }).orWhere({
        sender_id: receiverId,
        sender_type: 'anonymous',
        receiver_id: senderId,
        receiver_type: 'anonymous',
        conversation_type: 'anonymous',
      }).first()

      if (conversation == null) {
        const conversationUUID = await str_random(64)

        conversation = await Conversation.create({
          sender_id: senderId,
          sender_type: 'anonymous',
          receiver_id: receiverId,
          receiver_type: 'anonymous',
          conversation_type: 'anonymous',
          uuid: conversationUUID
        })
      }

    }

    await ConnectedUser.query().where({
      'user_id': senderId,
      'user_type': 'anonymous'
    }).orWhere({
      'user_id': receiverId,
      'user_type': 'anonymous'
    }).update({
      'conversation_id': conversation.id
    })

    messages = await Message.query().where('conversation_id', conversation.id).orderBy('id', 'desc').limit(perpage).fetch()

    return response.status(200).json({
      status: 'success',
      conversation: conversation,
      messages: messages
    })

  }


  async getAnonymousMessages({
    request,
    response,
    auth
  }) {

    const conversationId = request.input('id')
    const page = request.input('page')
    const sendeType = request.input('sender_type')
    const anonymousUuid = request.input('anonymous_uuid')

    var sender = {}
    if (sendeType == 'anonymous') {
      const user = await AnonymousUser.query().where('uuid', anonymousUuid).first()
      sender.sender_id = user.id
      sender.sender_type = sendeType
    } else {
      const user = await auth.getUser()
      sender.sender_id = user.id
      sender.sender_type = sendeType
    }

    if (sender == {}) {
      return response.status(400).json({
        status: 'error',
        message: 'يجب المصادقة على الدخول للمحادثة أولا'
      })
    }

    const next = (page - 1) * perpage

    const messages = await Message.query().where({
      'conversation_id': conversationId
    }).orderBy('id', 'desc').offset(next).limit(perpage).fetch()

    return response.status(200).json({
      status: 'success',
      messages: messages
    })
  }

  async getGroupMessages({
    request,
    response,
    auth
  }) {
    const country = request.input('country')
    const page = request.input('page')

    if (country == '') {
      return response.status(400).json({
        status: 'error',
        message: 'يجب تحديد الدولة قبل الدخول للمحادثة'
      })
    }

    const next = (page - 1) * perpage
    const messages = await GroupMessage.query().where({
      'country': country
    }).orderBy('id', 'desc').offset(next).limit(perpage).fetch()

    return response.status(200).json({
      status: 'success',
      messages: messages
    })
  }


  async getDirectMessages({
    request,
    response,
    auth
  }) {
    const page = request.input('page')
    const conversationUuid = request.input('conversation')

    const conversation = await Conversation.query().where('uuid', conversationUuid).first()

    const next = (page - 1) * perpage
    const messages = await Message.query().where({
      'conversation_id': conversation.id
    }).orderBy('id', 'desc').offset(next).limit(perpage).fetch()

    return response.status(200).json({
      status: 'success',
      messages: messages
    })
  }

  /**
   * Search for available user to chat with him
   * @param {request} param0
   * @param {response} param1
   * @param {auth} param2
   */
  async getDirectSenderReceiver({
    request,
    response,
    auth
  }) {
    const chatType = request.input('chat_type')

    var receiverUuid = request.input('receiver_uuid')
    var senderType = request.input('sender_type')

    var sender = null
    var receiver = null
    var conversation = {}
    var connectors = []
    var messages = []
    var receivers = []
    var senders = []

    if (chatType == 'sent') {

      if (senderType == 'normal') {
        const usr = await auth.getUser()
        sender = await User.query().select(['id', 'firstname', 'lastname', 'uuid', 'points', 'image', Database.raw("'normal' as user_type")]).where('id', usr.id).first()
      } else {
        const senderUuid = request.input('anonymous_uuid')
        sender = await AnonymousUser.query().select(['id', 'name as fullname', 'uuid', 'image', Database.raw("IF(STRCMP(gender, 'male') = 0, 'ذكر', 'أنثى') as gender"), Database.raw("'anonymous' as user_type")]).where('uuid', senderUuid).first()
      }

      receiver = await User.query().select(['id', 'firstname', 'lastname', 'points', 'uuid', 'image', Database.raw("'normal' as user_type")]).where('uuid', receiverUuid).first()

    } else {
      const usr = await auth.getUser()
      sender = await User.query().select(['id', 'firstname', 'lastname', 'uuid', 'points', 'image', Database.raw("'normal' as user_type")]).where('id', usr.id).first()

      if (senderType == 'normal') {
        receiver = await User.query().select(['id', 'firstname', 'lastname', 'uuid', 'points', 'image', Database.raw("'normal' as user_type")]).where('uuid', receiverUuid).first()
      } else {
        receiver = await AnonymousUser.query().select(['id', 'name as fullname', 'uuid', 'image', Database.raw("IF(STRCMP(gender, 'male') = 0, 'ذكر', 'أنثى') as gender"), Database.raw("'anonymous' as user_type")]).where('uuid', receiverUuid).first()
      }

    }

    if (receiver == null || receiver == undefined) {
      return response.status(400).json({
        status: 'error',
        messages: 'لم يتم العثور على صاحب هذا المعرف، يرجى استخدام معرف صحيح'
      })
    }

    conversation = await Conversation.query().where({

      'sender_id': sender.id,
      'sender_type': sender.user_type,
      'receiver_id': receiver.id,
      'receiver_type': receiver.user_type

    }).orWhere({

      'receiver_id': sender.id,
      'receiver_type': sender.user_type,
      'sender_id': receiver.id,
      'sender_type': receiver.user_type

    }).first()

    if (conversation == undefined || Object.keys(conversation).length == 0) {
      const newUUID = await str_random(20)

      if (receiver.user_type == sender.user_type && sender.id == receiver.id) {
        return response.status(400).json({
          status: 'error',
          messages: 'لا يمكنك محادثة نفسك :)'
        })
      }

      conversation = await Conversation.create({
        'uuid': newUUID,
        'sender_id': sender.id,
        'sender_type': sender.user_type,
        'receiver_id': receiver.id,
        'receiver_type': receiver.user_type,
        'conversation_type': 'direct'
      })

      if (sender.user_type == 'normal') {
        const user = await User.query().where('id', sender.id).first()
        user.points = user.points + 1
        await user.save()
      }

      if (receiver.user_type == 'normal') {
        const user = await User.query().where('id', receiver.id).first()
        user.points = user.points + 1
        await user.save()
      }

      await ConnectedUser.query().where({
        'user_id': sender.id,
        'user_type': sender.user_type
      }).orWhere({
        'user_id': receiver.id,
        'user_type': receiver.user_type
      }).update({
        'conversation_id': conversation.id
      })

    }

    const reactions = await ConversationReaction.query().with('emoji').where('conversation_id', conversation.id).fetch()


    // if (senderType == 'normal') {
      var connectors = await Database
        .select('conversations.id', 'conversations.sender_id as user_id', 'conversations.sender_type as user_type', 'messages.sent_at')
        .table('conversations')
        .leftOuterJoin('messages', 'conversations.id', 'messages.conversation_id')
        .where({
          'conversations.receiver_id': sender.id,
          'conversations.conversation_type': 'direct',
        }).groupByRaw('conversations.id').orderByRaw('messages.id DESC')

      for (let index = 0; index < connectors.length; index++) {
        const conversation = connectors[index];
        var record = null;
        if (conversation.user_type=='normal') {
          record = await User.query().where('id', conversation.user_id).first()
          record.user_type = 'normal'
          record.created_at = conversation.sent_at
          receivers[index] = record
        } else {
          record = await AnonymousUser.query().where('id', conversation.user_id).first()
          record.user_type = 'anonymous'
          record.created_at = conversation.sent_at
          receivers[index] = record
        }
      }

      connectors = await Database
        .select('conversations.id', 'conversations.receiver_id as user_id', 'conversations.receiver_type as user_type', 'messages.sent_at')
        .table('conversations')
        .leftOuterJoin('messages', 'conversations.id', 'messages.conversation_id')
        .where({
          'conversations.sender_id': sender.id,
          'conversations.conversation_type': 'direct',
        }).groupByRaw('conversations.id').orderByRaw('messages.id DESC')

      for (let index = 0; index < connectors.length; index++) {
        const conversation = connectors[index];
        var record = null;
        if (conversation.user_type=='normal') {
          record = await User.query().where('id', conversation.user_id).first()
          record.user_type = 'normal'
          record.created_at = conversation.sent_at
          senders[index] = record
        } else {
          record = await AnonymousUser.query().where('id', conversation.user_id).first()
          record.user_type = 'anonymous'
          record.created_at = conversation.sent_at
          senders[index] = record
        }
      }

    // }

    if (conversation != undefined && Object.keys(conversation).length > 0) {
      messages = await Message.query().where('conversation_id', conversation.id).orderBy('id', 'desc').limit(perpage).fetch()
    }

    return response.status(200).json({
      status: 'success',
      sender: sender,
      receiver: receiver,
      senders: senders,
      receivers: receivers,
      conversation: conversation,
      messages: messages,
      reactions: reactions
    })
  }

  async initGroupChat({
    request,
    response,
    auth
  }) {
    const country = request.input('country')

    if (country != null) {
      const messages = await GroupMessage.query().where('country', country).orderBy('id', 'desc').limit(perpage).fetch()
      const dateNow = new Date().toJSON().substr(0, 19).replace('T', ' ')
      // const queryLog = "select * from group_messages where country = 'PS' AND TIMESTAMPDIFF(HOUR, '" + dateNow + "', `sent_at`) <= 4 ORDER BY `id` DESC GROUP BY `sender_id`,`sender_type`"
      // const activeUsers = await Database.raw("SELECT * FROM `group_messages` WHERE `country` = ? AND TIMESTAMPDIFF(HOUR, `sent_at`, ?) <= 5 GROUP BY `sender_id`, `sender_type` ORDER BY `id` DESC ", [country, dateNow])
      const activeUsers = await GroupMessage.query().where('country', country).whereRaw("TIMESTAMPDIFF(MINUTE, `sent_at`, '" + dateNow + "') <= 5").orderBy('id', 'desc').groupBy(['sender_id', 'sender_type']).fetch()
      const senders = await GroupMessage.query().select(['sender_id', 'sender_type']).where('country', country).groupBy(['sender_id', 'sender_type']).fetch()

      var normalIds = []
      var anonymousIds = []
      for(let i in senders.rows) {
        const sender = senders.rows[i]
        if (sender['sender_type'] == 'normal') {
          normalIds.push(sender['sender_id'])
        } else {
          anonymousIds.push(sender['sender_id'])
        }
      }

      const normalUsers = await User.query().select(['id', Database.raw("CONCAT(firstname, ' ', lastname) as name"), 'image', Database.raw("'normal' as user_type")]).whereIn('id', normalIds).fetch()
      const anonymousUsers = await AnonymousUser.query().select(['id', 'name', 'image', Database.raw("'anonymous' as user_type")]).whereIn('id', anonymousIds).fetch()

      var receivers = {}
      for(let i in senders.rows) {
        const sender = senders.rows[i]
        if (sender['sender_type'] == 'normal') {
          for(let j in normalUsers.rows) {
            const normal = normalUsers.rows[j]
            if (normal['id'] == sender['sender_id']) {
              receivers['normal_' + normal.id] = normal
              break
            }
          }
        } else {
          for(let j in anonymousUsers.rows) {
            const anonymous = anonymousUsers.rows[j]
            if (anonymous['id'] == sender['sender_id']) {
              receivers['anonymous_' + anonymous.id] = anonymous
              break
            }
          }
        }
      }

      return response.status(200).json({
        status: 'success',
        activeUsers: activeUsers,
        dateNow: dateNow,
        receivers: receivers,
        normal: normalUsers,
        anonymous: anonymousUsers,
        messages: messages,
        // queryLog: queryLog,
      })

    } else {
      return response.status(400).json({
        status: 'error',
        code: 300
      })
    }
  }

}

module.exports = ConnectorController
