'use strict'

const Emoji = use('App/Models/Emoji')

class EmojiController {

    async stickers({ request, response }) {

        const stickers = await Emoji.query().where('status', 1).where('type', 'sticker').orderBy('sort', 'asc').fetch()

        return response.json({
            status: 'success',
            stickers: stickers
        })

    }

    async reactions({ request, response }) {

        const reactions = await Emoji.query().where('status', 1).where('type', 'reaction').orderBy('sort', 'asc').fetch()

        return response.json({
            status: 'success',
            reactions: reactions
        })

    }

}

module.exports = EmojiController
