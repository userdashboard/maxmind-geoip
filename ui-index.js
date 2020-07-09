const beautify = require('js-beautify').html
const fs = require('fs')
const HTML = require('@userdashboard/dashboard/src/html.js')
const template = fs.readFileSync('./ui-index-template.html').toString()
const moduleName = process.argv[2]
let uiPath, title

switch (moduleName) {
  case 'dashboard':
    uiPath = ''
    title = 'Dashboard'
    break
  case 'organizations':
    uiPath = '/organizations'
    title = 'Organizations module'
    break
  case 'maxmind-geoip':
    uiPath = '/maxmind'
    title = 'MaxMind GeoIP module'
    break
  case 'stripe-connect':
    uiPath = '/connect'
    title = 'Stripe Connect module'
    break
  case 'stripe-subscriptions':
    uiPath = '/subscriptions'
    title = 'Stripe Subscriptions module'
    break
  case 'example-web-app':
    uiPath = '/example-web-app'
    title = 'Example web app'
    break
  case 'example-subscription-web-app':
    uiPath = '/example-subscription-web-app'
    title = 'Example subscription web app'
    break
}
global.rootPath = __dirname
global.applicationPath = __dirname
const doc = HTML.parse(template)
doc.getElementById('title').child = [{
  node: 'text',
  text: `${title} UI index`
}]
doc.getElementsByTagName('title')[0].child = [{
  node: 'text',
  text: `${title} UI index`
}]
const navbarTemplate = doc.getElementById('navbar')
if (navbarTemplate) {
  doc.getElementById('side-navigation').child = navbarTemplate.child
  navbarTemplate.parentNode.removeChild(navbarTemplate)
}
const sitemap = scanSiteMap()
if (sitemap.guest && sitemap.guest.length) {
  HTML.renderList(doc, sitemap.guest, 'route-template', 'guest-routes-list')
} else {
  const container = doc.getElementById('guest-container')
  container.parentNode.removeChild(container)
}
if (sitemap.user && sitemap.user.length) {
  HTML.renderList(doc, sitemap.user, 'route-template', 'user-routes-list')
} else {
  const container = doc.getElementById('user-container')
  container.parentNode.removeChild(container)
}
if (sitemap.administrator && sitemap.administrator.length) {
  HTML.renderList(doc, sitemap.administrator, 'route-template', 'administrator-routes-list')
} else {
  const container = doc.getElementById('administrator-container')
  container.parentNode.removeChild(container)
}

const html = beautify(doc.toString(), {
  indent_size: 2,
  space_in_empty_paren: true
})
const uiFile = moduleName + '-ui.html'
fs.writeFileSync(`${process.env.DOCUMENTATION_PATH || '.'}/${uiFile}`, html)

function scanSiteMap () {
  const sitemap = {
    guest: [],
    user: [],
    administrator: []
  }
  const sitemapFilePath = `${moduleName}/sitemap.txt`
  if (!fs.existsSync(sitemapFilePath)) {
    return sitemap
  }
  let sitemaptxt = fs.readFileSync(sitemapFilePath).toString()
  sitemaptxt = sitemaptxt.substring(sitemaptxt.indexOf('URL'))
  const lines = sitemaptxt.split('\n')
  for (const line of lines) {
    if (!line.startsWith('/') ||
      line.startsWith('/api/') ||
      line.startsWith('/webhooks/') ||
      line.startsWith('/public/') ||
      line.indexOf('@userdashboard') > -1) {
      continue
    }
    const fullscreen = line.indexOf('FULLSCREEN') > -1
    const guest = line.indexOf('GUEST') > -1
    const url = line.substring(0, line.indexOf(' '))
    if (url === '/' || url === '/home') {
      continue
    }
    if (uiPath && (url === '/account' || url === '/administrator')) {
      continue
    }
    let screenshotPath = `/screenshots${url}`
    let pageURL = url
    if (pageURL === '/' ||
      pageURL === `/account${uiPath}` ||
      pageURL === `/administrator${uiPath}`) {
      pageURL += pageURL === '/' ? 'index' : '/index'
      screenshotPath += url === '/' ? 'index' : '/index'
    }
    if (!fs.existsSync(`./${moduleName}/src/www${pageURL}.html`)) {
      continue
    }
    if (!fs.existsSync(`.${screenshotPath}`)) {
      continue
    }
    const files = fs.readdirSync(`.${screenshotPath}`)
    let src
    for (const file of files) {
      if (file.indexOf('desktop') === -1 || file.indexOf('-en.png') === -1) {
        continue
      }
      if (file.indexOf('submit-form') > -1 || file.indexOf('complete') > -1) {
        src = `${screenshotPath}/${file}`
        break
      }
    }
    const html = fs.readFileSync(`./${moduleName}/src/www${pageURL}.html`).toString()
    let title = html.substring(html.indexOf('<title>') + '<title>'.length)
    title = title.substring(0, title.indexOf('<'))
    const array = guest ? sitemap.guest : (pageURL.indexOf('/administrator') > -1 ? sitemap.administrator : sitemap.user)
    array.push({
      object: 'route',
      url,
      src,
      title,
      guest,
      fullscreen
    })
  }
  return sitemap
}
