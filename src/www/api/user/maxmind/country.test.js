/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/maxmind/country', () => {
  describe('Country#GET', () => {
    it('should require ip address', async () => {
      const req = TestHelper.createRequest('/api/user/maxmind/country?ip=', 'GET')
      let errorMesage
      try {
        await req.route.api.get(req)
      } catch (error) {
        errorMesage = error.message
      }
      assert.strictEqual(errorMesage, 'invalid-ip')
    })

    it('should return country data', async () => {
      const req = TestHelper.createRequest('/api/user/maxmind/country?ip=8.8.8.8', 'GET')
      const country = await req.get(req)
      assert.strictEqual(country.country.iso_code, 'US')
    })
  })
})
