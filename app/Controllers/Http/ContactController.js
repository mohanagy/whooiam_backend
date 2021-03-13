'use strict'

const Mail = use('Mail')
const Config = use('Config')
const Contact = use('App/Models/Contact')

class ContactController {

  async contactUs({
    request,
    response
  }) {
    const data = request.only(['name', 'title', 'message'])
    try {

      await Contact.create({
        name: data.name,
        title: data.title,
        description: data.message
      })

      await Mail.send('emails.contact', data, (message) => {
        const appEmail = Config.get('app.email')
        message
          .to(appEmail)
          .from(data.email)
          .subject(data.title)
      })
    } catch {
      return response.json({
        status: 'error',
        message: "Email didnt sent!"
      })
    }


    return response.json({
      status: 'success',
      message: 'Email sent!'
    })
  }
}

module.exports = ContactController
