/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/maxmind/country', () => {
  describe('exceptions', () => {
    describe('invalid-ip', () => {
      it('missing querystring ip', async () => {
        const req = TestHelper.createRequest('/api/user/maxmind/country', 'GET')
        let errorMesage
        try {
          await req.get()
        } catch (error) {
          errorMesage = error.message
        }
        assert.strictEqual(errorMesage, 'invalid-ip')
      })

      it('invalid querystring ip', async () => {
        const req = TestHelper.createRequest('/api/user/maxmind/country?ip=invalid', 'GET')
        let errorMesage
        try {
          await req.get()
        } catch (error) {
          errorMesage = error.message
        }
        assert.strictEqual(errorMesage, 'invalid-ip')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const req = TestHelper.createRequest('/api/user/maxmind/country?ip=8.8.8.8', 'GET')
      const country = await req.get()
      assert.strictEqual(country.country.iso_code, 'US')
    })
  })
})
