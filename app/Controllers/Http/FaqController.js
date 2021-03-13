'use strict'

const Faq = use('App/Models/Faq')

class FaqController {

    async index({ request, response }) {

    	var isHome = request.input('is-home')

        var faqs = {}
        if (isHome != undefined) {
        	faqs = await Faq.query().where('status', 1).orderBy('id', 'asc').limit(4).fetch()
        }  else {
        	faqs = await Faq.query().where('status', 1).orderBy('id', 'asc').fetch()
        }

        return response.json({
            status: 'success',
            data: faqs
        })

    }

}

module.exports = FaqController
