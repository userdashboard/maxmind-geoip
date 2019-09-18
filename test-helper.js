/* eslint-env mocha */
global.applicationPath = global.applicationPath || __dirname
global.puppeteer = global.puppeteer || require('puppeteer')

const TestHelper = require('@userdashboard/dashboard/test-helper.js')
module.exports = TestHelper
