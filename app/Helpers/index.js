'use strict'

const crypto = use('crypto')

/**
 * Generate "random" alpha-numeric string.
 *
 * @param  {int}      length - Length of the string
 * @param  {string}   type - Type of the letters of string [numeric, both, letters]
 * @return {string}   The result
 */
const str_random = async (length = 40, type = 'both') => {
    let string = ''
    let len = string.length
  
    if (len < length) {
      let size = length - len
      let bytes = await crypto.randomBytes(size)
      let buffer = new Buffer.from(bytes)
  
      var lettersType = ''
      if (type == 'numeric') lettersType = /[^0-9]/g
      else if (type == 'letters') lettersType = /[^A-Z]/g
      else lettersType = /[^A-Z0-9]/g

      string += buffer
        .toString('base64')
        .replace(lettersType, '')
        .substr(0, size)
    }
  
    return string
  }
  
  module.exports = {
    str_random
  }
  