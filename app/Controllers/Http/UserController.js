'use strict'

const User = use('App/Models/User')
const UserImage = use('App/Models/UserImage')
// const Conversation = use('App/Models/Conversation')
const AnonymousUser = use('App/Models/AnonymousUser')
const Reaction = use('App/Models/Reaction')

const UserService = use('App/Services/UserService')

const Hash = use('Hash')
const Database = use('Database')
// const Drive = use('Drive')
const Helpers = use('Helpers')
const { str_random } = use('App/Helpers')


class UserController {

  constructor() {
    this.userService = new UserService
  }

  async profile({
    auth,
    response
  }) {

    const user = await User.query()
      .where('id', auth.current.user.id)
      .with('images', (builder) => {
        builder.orderBy('id', 'desc').limit(6)
      })
      .firstOrFail()

    return response.json({
      status: 'success',
      data: user
    })

  }

  async getInfo ({ request, response }) {
    const userId = request.input('id')

    var profile = await User.query().with('reactions.emoji').with('images', (builder) => {
      builder.orderBy('id', 'desc').limit(6)
    }).where('uuid', userId).first()

    if (profile != null) {
      var totalReactions = await Reaction.query().where('user_id', profile.id).getSum('count')

      if (profile.email_privacy == 0) profile.email = null
      if (profile.mobile_privacy == 0) profile.mobile = null
      if (profile.gender == 'male') profile.gender = 'ذكر'
      else profile.gender = 'أنثى'

      return response.json({
        status: 'success',
        profile: profile,
        total: totalReactions,
      })

    } else {
      return response.json({
        status: 'error',
        'message': 'هاذا الحساب غير متوفر',
      })
    }
  }

  async getMessages({ request, view, response, auth }) {

    const user = await auth.getUser()
    var conversations = []

    if (request.input('type') == 'received') {

      conversations = await Database
      .select(Database.raw('COUNT(conversations.id) as total'), 'conversations.id', 'conversations.sender_id as user_id', 'conversations.sender_type as user_type', 'messages.message', 'messages.sent_at')
      .table('conversations')
      .leftJoin('messages', 'messages.conversation_id', 'conversations.id')
      .where({
        'messages.message_type': 'text',
        'conversations.receiver_id': user.id,
        'conversations.conversation_type': 'direct',
      })
      .where('messages.sender_id', '!=', user.id)
      .groupBy('messages.conversation_id')
      .orderBy('messages.id', 'desc')
      .limit(10)

    } else {

      conversations = await Database
      .select(Database.raw('COUNT(conversations.id) as total'), 'conversations.id as conversation_id', 'conversations.receiver_id as user_id', 'conversations.receiver_type as user_type', 'messages.message', 'messages.sent_at')
      .table('conversations')
      .join('messages', 'messages.conversation_id', 'conversations.id')
      .where({
        'messages.message_type': 'text',
        'conversations.sender_id': user.id,
        'conversations.conversation_type': 'direct'
      })
      .groupBy('messages.conversation_id')
      .orderBy('messages.id', 'desc')
      .limit(10)

    }

    var normalUsers = [], anonymousUsers = []
    for (let index = 0; index < conversations.length; index++) {
      const conversation = conversations[index];
      if (conversation.user_type=='normal') {
        const record = await User.query().where('id', conversation.user_id).first()
        normalUsers[conversation.user_id] = record
      } else {
        const record = await AnonymousUser.query().where('id', conversation.user_id).first()
        anonymousUsers[conversation.user_id] = record
      }
    }

    return response.json({
      status: 'success',
      conversations: conversations,
      normalUsers: normalUsers,
      anonymousUsers: anonymousUsers,
    })

  }

  async me({
    auth,
    response
  }) {
    // const user = await auth.getUser()

    const profile = await User.query()
      .where('id', auth.current.user.id)
      .with('images', (builder) => {
        builder.orderBy('id', 'desc').limit(6)
      })
      .firstOrFail()

    if (profile.email_privacy == 0) profile.email = null
    if (profile.mobile_privacy == 0) profile.mobile = null
    if (profile.gender == 'male') profile.gender = 'ذكر'
    else profile.gender = 'أنثى'

    return response.json({
      status: 'success',
      data: profile
    })
  }

  async checkUserExists({ request, response }){

    const count = await User.query().where('email', request.input('email')).getCount()
    return response.json({
      exists: count > 0 ? true : false,
      count: count
    })

  }

  async edit({
    auth,
    response
  }) {
    const profile = await auth.getUser()

    return response.json({
      status: 'success',
      data: profile
    })
  }

  async uploadImage({
    request,
    auth,
    response
  }) {
    const profilePic = request.file('image', {
      types: ['image'],
      size: '1mb',
      // extnames: ['jpg', 'jpeg', 'png']
    })

    const user = await auth.getUser()

    var imageName = ''
    do {
      imageName = await str_random(15, 'both')
    } while (await UserImage.query().where('image', imageName).count() > 0)

    const fullPath = 'https://backend.whooiam.com/uploads/' + user.id + '/' + imageName + '.jpg'
    const images = await UserImage.create({
      user_id: user.id,
      image: fullPath
    })

    user.image = fullPath
    await user.save()

    await profilePic.move('public/uploads/' + user.id, {
      name: imageName + '.jpg',
      overwrite: true
    })

    if (!profilePic.moved()) {
      return profilePic.error()
    }

    return response.status(200).json({
      status: 'success',
      images: images,
      message: 'تم تعديل الصورة بنجاح'
    })
  }

  async updateProfile({
    request,
    auth,
    response
  }) {
    try {
      const user = auth.current.user

      user.firstname = request.input('firstname')
      user.lastname = request.input('lastname')
      user.email = request.input('email')
      user.mobile = request.input('mobile')
      const birthdate = request.input('birthdate')
      user.gender = request.input('gender')
      user.bio = request.input('bio')
      user.email_privacy = request.input('email_privacy')
      user.mobile_privacy = request.input('mobile_privacy')

      user.birthdate = birthdate.slice(0, 10)

      await user.save()

      return response.json({
        status: 'success',
        message: 'تم حفظ بياناتك الشخصية بنجاح',
        data: user
      })
    } catch (error) {
      return response.status(400).json({
        status: 'error',
        message: 'توجد مشكلة في حفظ بيانات الملف الشخصي، حاول في وقت آخر'
      })
    }
  }

  async changePassword({
    request,
    auth,
    response
  }) {
    const user = auth.current.user
    const verifyPassword = await Hash.verify(
      request.input('current'),
      user.password
    )
    if (!verifyPassword) {
      return response.status(400).json({
        status: 'error',
        message: 'كلمتا المرور غير متطابقات، حاول إدخال البيانات الصحيحة'
      })
    }
    user.password = await Hash.make(request.input('password'))
    await user.save()
    return response.json({
      status: 'success',
      message: 'تهانينا! تم تغيير كلمة المرور بنجاح'
    })
  }

  async changeUuid({
    request,
    auth,
    response
  }) {
    let status = await this.userService.createOrUpdateUuid(auth, request.input('uuid'))
    var responseMessage = {}

    if (status) {
      responseMessage = {
        status: 'success',
        message: 'تهانينا! تم إنشاء معرف جديد'
      }
    } else {
      responseMessage = {
        status: 'error',
        message: 'حدثت مشكلة أثناء إنشاء معرف جديد، يرجى المحاولة في وقت آخر, أو استخدام معرف آخر.',
      }
    }

    return response.json(responseMessage)
  }

  async generateUuid({
    auth,
    response
  }) {
    let uuid = await this.userService.generateUuid(auth)
    return response.json({
      status: 'success',
      uuid: uuid
    })
  }

}

module.exports = UserController
