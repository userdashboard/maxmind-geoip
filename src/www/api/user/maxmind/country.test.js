/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/maxmind/country', () => {
  describe('Country#GET', () => {
    it('should return country data', async () => {
      const req = TestHelper.createRequest('/api/user/maxmind/country', 'GET')
      const country = await req.get(req)
      assert.strictEqual(country.country.iso_code, 'US')
    })
  })
})
