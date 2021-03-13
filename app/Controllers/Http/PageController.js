'use strict'

let Page = use('App/Models/Page')

class PageController {

  async about({
    response
  }) {

    const page = await Page.query().where('key', 'about').first()

    return response.json({
      status: 'success',
      data: page
    })

  }

  async privacyPolicy({
    response
  }) {

    const page = await Page.query().where('key', 'privacy-policy').first()

    return response.json({
      status: 'success',
      data: page
    })

  }  

  async termsOfUse({
    response
  }) {

    const page = await Page.query().where('key', 'terms-of-use').first()

    return response.json({
      status: 'success',
      data: page
    })

  }

}

module.exports = PageController
