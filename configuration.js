const beautify = require('js-beautify').html
const fs = require('fs')
const path = require('path')
const HTML = require('@userdashboard/dashboard/src/html.js')
const template = fs.readFileSync('./configuration-template.html').toString()
const moduleName = process.argv[2]
const modulePath = process.argv[3]

let title
if (moduleName === 'dashboard') {
  title = 'Dashboard'
} else if (moduleName === 'organizations') {
  title = 'Organizations module'
} else if (moduleName === 'maxmind-geoip') {
  title = 'MaxMind GeoIP module'
} else if (moduleName === 'stripe-connect') {
  title = 'Stripe Connect module'
} else if (moduleName === 'stripe-subscriptions') {
  title = 'Stripe Subscriptions module'
}

const testsFilePath = path.join(modulePath, 'tests.txt')
if (!fs.existsSync(testsFilePath)) {
  process.exist()
}
let tests = fs.readFileSync(testsFilePath).toString()
tests = tests.substring(0, tests.indexOf('internal-api'))
tests = tests.split('\n')
let start = false
const properties = {}
let lastProperty
for (const i in tests) {
  const line = tests[i].trim()
  if (!line.length) {
    continue
  }
  if (!start) {
    if (line === 'index') {
      start = true
    }
    continue
  }
  if (line.indexOf(' ') === -1) {
    lastProperty = line
    properties[lastProperty] = {}
    continue
  }
  if (!lastProperty) {
    continue
  }
  if (!properties[lastProperty].description) {
    properties[lastProperty].description = line
    continue
  }
  if (line.indexOf('default') > -1) {
    properties[lastProperty].default = line.substring('✓ default '.length)
  } else {
    properties[lastProperty].value = line.substring('✓ '.length)
    lastProperty = null
  }
}
const data = []
const sorted = Object.keys(properties).sort()
for (const property of sorted) {
  const description = properties[property].description
  const unset = properties[property].default || ''
  let value = properties[property].value || ''
  if (value.indexOf(',') > -1) {
    value = value.split(',').join(', ')
  }
  data.push({
    object: 'variable',
    name: property,
    description,
    default: unset,
    value
  })
}
global.rootPath = __dirname
global.applicationPath = __dirname
const doc = HTML.parse(template)
doc.getElementById('title').child = [{
  node: 'text',
  text: `${title} API index`
}]
doc.getElementsByTagName('title')[0].child = [{
  node: 'text',
  text: `${title} configuration variables`
}]
const navbarTemplate = doc.getElementById('navbar')
doc.getElementById('side-navigation').child = navbarTemplate.child
navbarTemplate.parentNode.removeChild(navbarTemplate)

HTML.renderTable(doc, data, 'variable-row-template', 'variables-table')

createFolderSync(modulePath.substring(0, modulePath.lastIndexOf('/')))
const html = beautify(doc.toString(), { indent_size: 2, space_in_empty_paren: true })
fs.writeFileSync(`${process.env.DOCUMENTATION_PATH || '.'}/${moduleName}-api.html`, html)

function createFolderSync (path) {
  const nested = path.substring(__dirname.length)
  const nestedParts = nested.split('/')
  let nestedPath = __dirname
  for (const part of nestedParts) {
    nestedPath += `/${part}`
    if (!fs.existsSync(nestedPath)) {
      fs.mkdirSync(nestedPath)
    }
  }
}
