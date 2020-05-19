/* eslint-env mocha */
global.applicationPath = global.applicationPath || __dirname

const TestHelper = require('@userdashboard/dashboard/test-helper.js')
module.exports = TestHelper

before (async () => {
    require('./index.js').setup()
})