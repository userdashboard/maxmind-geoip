/* eslint-env mocha */
global.applicationPath = __dirname

const dashboard = require('@userappstore/dashboard')
module.exports = dashboard.loadTestHelper()
