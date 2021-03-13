'use strict'

let Country = use('App/Models/Country')

class CountryController {

  async getAllCountries({
    response
  }) {

    const countries = await Country.query().where('status', '1').where('deleted_at', null).fetch()

    return response.json({
      status: 'success',
      countries: countries
    })

  }

}

module.exports = CountryController
