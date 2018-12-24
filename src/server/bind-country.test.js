/* eslint-env mocha */
const assert = require('assert')
const Country = require('./bind-country.js')

describe('server/bind-country', () => {
  describe('BindCountry#GET', () => {
    it('should bind country data to req', async () => {
      const req = {}
      req.ip = '8.8.8.8'
      await Country.before(req)
      assert.strictEqual(req.country.country.iso_code, 'US')
    })
  })
})
