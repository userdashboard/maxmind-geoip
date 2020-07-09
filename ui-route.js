const beautify = require('js-beautify').html
const fs = require('fs')
const HTML = require('@userdashboard/dashboard/src/html.js')
const path = require('path')
const template = fs.readFileSync('./ui-route-template.html').toString()
const moduleName = process.argv[2]
const htmlFilePath = process.argv[3]
let embeddedPath

let moduleTitle
if (moduleName === 'dashboard') {
  moduleTitle = 'Dashboard'
  embeddedPath = ''
} else if (moduleName === 'organizations') {
  moduleTitle = 'the Organizations module'
  embeddedPath = '/' + moduleName
} else if (moduleName === 'maxmind-geoip') {
  moduleTitle = 'the MaxMind GeoIP module'
} else if (moduleName === 'stripe-connect') {
  moduleTitle = 'the Stripe Connect module'
  embeddedPath = moduleName === 'stripe-connect' ? '/connect' : '/subscriptions'
} else if (moduleName === 'stripe-subscriptions') {
  moduleTitle = 'the Stripe Subscriptions module'
  embeddedPath = moduleName === 'stripe-connect' ? '/connect' : '/subscriptions'
}

const pageHTML = fs.readFileSync(htmlFilePath).toString()
let pageTitle = pageHTML.substring(pageHTML.indexOf('<title>') + '<title>'.length)
pageTitle = pageTitle = pageTitle.substring(0, pageTitle.indexOf('</title>'))
if (pageTitle.indexOf('${') > -1) {
  pageTitle = pageTitle.substring(0, pageTitle.lastIndexOf('.'))
  pageTitle = pageTitle.replace('${', '')
}
if (pageHTML.indexOf('submit-form') === -1 && pageTitle.indexOf('View ') === -1) {
  pageTitle = 'Viewing ' + pageTitle
}
const folderName = htmlFilePath.split('/').pop().replace('.html', '')
const administrator = htmlFilePath.indexOf('/administrator') > -1
const imagePath = `screenshots/${administrator ? 'administrator' : 'account'}${embeddedPath}/${folderName}/`
const screenshotPath = path.join(process.env.DOCUMENTATION_PATH || __dirname, imagePath)
if (!fs.existsSync(screenshotPath)) {
  process.exit(0)
}
const screenshots = fs.readdirSync(screenshotPath)
global.rootPath = __dirname
global.applicationPath = __dirname
const doc = HTML.parse(template)
doc.getElementById('title').child = [{
  node: 'text',
  text: moduleTitle.replace('the ', '').replace(' module', '') + ` UI guide: ${pageTitle}`
}]
doc.getElementsByTagName('title')[0].child = [{
  node: 'text',
  text: `"${pageTitle}" documentation for ${moduleTitle}`
}]
const navbarTemplate = doc.getElementById('navbar')
doc.getElementById('side-navigation').child = navbarTemplate.child
navbarTemplate.parentNode.removeChild(navbarTemplate)
const screenshotData = []
for (const screenshot of screenshots) {
  if (screenshot.indexOf('desktop-en.png') === -1) {
    continue
  }
  const filenameParts = screenshot.split('-')
  let screenshotDescription = ''
  for (const part of filenameParts) {
    if (part === 'desktop-en.png') {
      break
    }
    if (screenshotDescription === '') {
      screenshotDescription = part + '.  '
      continue
    }
    screenshotDescription += ' ' + part.charAt(0).toUpperCase() + part.substring(1)
  }
  screenshotDescription = screenshotDescription.trim()
  screenshotData.push({
    object: 'screenshot',
    urlPath: `/${imagePath}${screenshot}`,
    description: screenshotDescription.trim()
  })
}
console.log('rendering', screenshotPath, screenshotData)
HTML.renderList(doc, screenshotData, 'screenshot-template', 'screenshots')

let htmlPath = `${administrator ? 'administrator' : 'account'}${embeddedPath}`
htmlPath = path.join(process.env.DOCUMENTATION_PATH || __dirname, htmlPath)
createFolderSync(htmlPath)
const html = beautify(doc.toString(), { indent_size: 2, space_in_empty_paren: true })
fs.writeFileSync(`${htmlPath}/${folderName}.html`, html)

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
