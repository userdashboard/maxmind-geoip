/**
 * The sitemaps are generated using CSS and HTML to create
 * a tree diagram.
 *
 * First the pages are indexed by scanning the nominated
 * folder's src/www folder for HTML spages.   The titles
 * are extracted from the page.  All page-accompanying
 * NodeJS files are parsed.  The navigation 'navbar*.html'
 * files are scanned after the pages.
 *
 * If a page is noncotigious it means it has no navbar
 * defined in its <HTML> tag so the page NodeJS and
 * HTML contents are checked to see if anything
 * redirects to the page.
 *
 * The screenshot for each route is selected from the
 * generated screenshots, prioritizing the form completion
 * and viewing screenshots.
 */

const beautify = require('js-beautify').html
const fs = require('fs')
const HTML = require('@userdashboard/dashboard/src/html.js')
const path = require('path')
const template = fs.readFileSync('./ui-sitemap-template.html').toString()
const moduleName = process.argv[2]
let uiPath, title, exampleApp
let idNumber = 0

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
    title = 'Example web app'
    exampleApp = true
    break
  case 'example-subscription-web-app':
    title = 'Example subscription web app'
    exampleApp = true
    break
}

const pageIndex = {}
const navbars = []
const instancePath = process.argv[3]
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const rootPath = exampleApp ? `${instancePath}/${moduleName}/application-server/src/www` : instancePath
scanHTMLPages(rootPath)
if (exampleApp) {
  const modules = fs.readdirSync(`${instancePath}/${moduleName}/dashboard-server/node_modules/@userdashboard/`)
  for (const module of modules) {
    scanHTMLPages(`${instancePath}/${moduleName}/dashboard-server/node_modules/@userdashboard/${module}/src/www`)
  }
}
scanNavigationBars(`${instancePath}/${moduleName}/src/www`)
if (exampleApp) {
  const modules = fs.readdirSync(`${instancePath}/${moduleName}/dashboard-server/node_modules/@userdashboard/`)
  for (const module of modules) {
    scanNavigationBars(`${instancePath}/${moduleName}/dashboard-server/node_modules/@userdashboard/${module}/src/www`)
  }
}

const tree = {
  '/': {}
}
mapTreeIndex()
// render the document
global.rootPath = __dirname
global.applicationPath = __dirname
console.log('parsiung template', template)
const doc = HTML.parse(template)
console.log(doc.toString())
doc.getElementById('title').child = [{
  node: 'text',
  text: `${title} sitemap`
}]
doc.getElementsByTagName('title')[0].child = [{
  node: 'text',
  text: `${title} sitemap`
}]
const navbarTemplate = doc.getElementById('navbar')
if (navbarTemplate) {
  doc.getElementById('side-navigation').child = navbarTemplate.child
  navbarTemplate.parentNode.removeChild(navbarTemplate)
}
if (exampleApp) {
  const accountTree = tree['/']['/account']
  const administratorTree = tree['/']['/administrator']
  delete (tree['/']['/account'])
  delete (tree['/']['/administrator'])
  renderPath(tree['/'], '/')
  renderPath(accountTree, '/account')
  renderPath(administratorTree, '/administrator')
} else {
  renderPath(tree['/']['/account'], '/account')
  renderPath(tree['/']['/administrator'], '/administrator')
}
const emptyTags = doc.getElementsByTagName('ul')
for (const tag of emptyTags) {
  if (!tag.child || !tag.child.length) {
    tag.parentNode.removeChild(tag)
  }
}

for (let i = 0, len = idNumber; i < len; i++) {
  const list = doc.getElementById(`route-list-${i}`)
  if (list && !list.child.length) {
    list.parentNode.removeChild(list)
  }
}

const html = beautify(doc.toString(), {
  indent_size: 2,
  space_in_empty_paren: true
})
const uiFile = moduleName + '-sitemap.html'
fs.writeFileSync(`${process.env.DOCUMENTATION_PATH || '.'}/${uiFile}`, html)

function renderPath (node, urlPath, parentid) {
  let pageInfo = pageIndex[`${urlPath}/index.html`] || pageIndex[urlPath]
  if (!pageInfo) {
    pageInfo = {
      object: 'route',
      id: idNumber++,
      urlPath,
      title: urlPath,
      screenshotPath: 'none'
    }
  }
  const route = {
    object: 'route',
    id: pageInfo.id,
    urlPath: pageInfo.urlPath,
    title: pageInfo.title,
    screenshotPath: pageInfo.screenshotPath
  }
  if (exampleApp) {
    route.urlPath = '#'
  }
  let target
  if (parentid) {
    target = `route-list-${parentid}`
  } else {
    target = 'sitemap'
  }
  if (!doc.getElementById(`route-list-${route.id}`)) {
    HTML.renderTemplate(doc, route, 'route-template', target)
  }
  if (!exampleApp && (urlPath === '/' || urlPath === '/home')) {
    const brokenLink = doc.getElementById(`link-${route.id}`)
    if (brokenLink && brokenLink.parentNode) {
      brokenLink.parentNode.removeChild(brokenLink)
    }
    const emptyContainer = doc.getElementById(`route-container-${route.id}`)
    if (emptyContainer && emptyContainer.parentNode) {
      emptyContainer.parentNode.removeChild(emptyContainer)
    }
  }
  if (!exampleApp && uiPath && (urlPath === '/account' || urlPath === '/administrator')) {
    const brokenLink = doc.getElementById(`link-${route.id}`)
    if (brokenLink && brokenLink.parentNode) {
      brokenLink.parentNode.removeChild(brokenLink)
    }
  }
  const nodeKeys = node ? Object.keys(node) : null
  if (!nodeKeys || !nodeKeys.length) {
    return
  }
  nodeKeys.sort(indexHomeThenDashboard)
  for (const nestedURL of nodeKeys) {
    renderPath(node[nestedURL], nestedURL, route.id)
  }
}

function mapTreeIndex () {
  // first map navigation bars and their links
  for (const navbar of navbars) {
    const pathParts = navbar.urlPath.substring(1).split('/')
    let lastNode = tree['/']
    let cumulative = ''
    for (const part of pathParts) {
      cumulative += '/' + part
      if (!lastNode[cumulative]) {
        lastNode[cumulative] = {}
      }
      lastNode = lastNode[cumulative]
    }
    for (const link of navbar.links) {
      lastNode[link.urlPath] = {}
    }
  }
  // map the noncontigious pages
  for (const isolatedPath in pageIndex) {
    if (isolatedPath === '/' || (!exampleApp && isolatedPath === '/home')) {
      continue
    }
    const isolatedPage = pageIndex[isolatedPath]
    if (!isolatedPage.detached) {
      continue
    }
    const pathParts = isolatedPage.urlPath.substring(1).split('/')
    let lastNode = tree['/']
    let cumulative = ''
    for (const part of pathParts) {
      cumulative += '/' + part
      if (!lastNode[cumulative]) {
        lastNode[cumulative] = {}
      }
      lastNode = lastNode[cumulative]
    }
  }
  // remap noncontigious files if anohther page redirects to it
  for (const isolatedPath in pageIndex) {
    const isolatedPage = pageIndex[isolatedPath]
    if (!isolatedPage.detached ||
      isolatedPath === '/' ||
      isolatedPath === '/home') {
      continue
    }
    // try and find a better parent
    for (const parentPath in pageIndex) {
      if (parentPath === isolatedPath) {
        continue
      }
      const possibleParentPage = pageIndex[parentPath]
      if (possibleParentPage.urlPath === '/' ||
        possibleParentPage.urlPath === '/home' ||
        possibleParentPage.urlPath === '/account/signin' ||
        possibleParentPage.urlPath === '/account/register') {
        continue
      }
      let matchHTML
      if (possibleParentPage.pageHTML) {
        if (possibleParentPage.pageHTML.indexOf('</head>') > -1) {
          let pageHeader = possibleParentPage.pageHTML.substring(0, possibleParentPage.pageHTML.indexOf('</head>'))
          pageHeader = pageHeader.substring(pageHeader.indexOf('<head>'))
          const header = HTML.parse(pageHeader)
          const metaTags = header.getElementsByTagName('meta')
          if (metaTags && metaTags.length) {
            for (const metaTag of metaTags) {
              if (!metaTag.attr || metaTag.attr['http-equiv'] !== 'refresh') {
                continue
              }
              matchHTML = metaTag.attr.content.indexOf(isolatedPath) > -1
            }
          }
        }
      }
      let matchJS
      if (!matchHTML && possibleParentPage.pageJS) {
        let redirect = possibleParentPage.pageJS.substring(possibleParentPage.pageJS.indexOf('res.writeHead(302, {'))
        redirect = redirect.substring(0, redirect.indexOf('res.end()'))
        matchJS = redirect && redirect.indexOf(isolatedPath) > -1
      }
      if (!matchHTML && !matchJS) {
        continue
      }
      const parentPathParts = parentPath.substring(1).split('/')
      let lastNode = tree['/']
      let cumulative = ''
      for (const part of parentPathParts) {
        cumulative += '/' + part
        if (!lastNode[cumulative]) {
          break
        }
        lastNode = lastNode[cumulative]
      }
      deleteTreePath(isolatedPath)
      lastNode[isolatedPath] = {}
    }
  }
  // merge the 'single' pages with their 'plural' counterparts
  for (const pluralPath in pageIndex) {
    if (!pluralPath.endsWith('s')) {
      continue
    }
    const singlePath = pluralPath.substring(0, pluralPath.length - 1)
    if (!pageIndex[singlePath]) {
      continue
    }
    console.log('tree', tree)
    const parentPath = pluralPath.substring(0, pluralPath.lastIndexOf('/'))
    const parentPathParts = parentPath.substring(1).split('/')
    let parentNode = tree['/']
    let cumulative = ''
    console.log('parentPath', parentPath)
    console.log('pluralPath', pluralPath)
    console.log('singlePath', singlePath)
    for (const part of parentPathParts) {
      cumulative += '/' + part
      parentNode = parentNode[cumulative]
    }
    const singleNode = parentNode[singlePath]
    deleteTreePath(singlePath)
    parentNode[pluralPath] = parentNode[singlePath.replace(singlePath, pluralPath)] || {}
    parentNode[pluralPath][singlePath] = singleNode
  }
}

function deleteTreePath (path) {
  function scan (node) {
    for (const key in node) {
      if (key === path) {
        delete (node[key])
        break
      }
      if (node[key] && Object.keys(node[key]).length) {
        scan(node[key])
      }
    }
  }
  scan(tree)
}

function scanHTMLPages (directoryPath) {
  if (directoryPath.indexOf('node_modules') > -1 && directoryPath.indexOf('@userdashboard') === -1) {
    return
  }
  if (directoryPath.indexOf('node_modules') < directoryPath.lastIndexOf('node_modules')) {
    return
  }
  console.log('scanHTMLPages', directoryPath)
  if (!fs.existsSync(directoryPath)) {
    console.log('folder does not exist')
    return
  }
  const allFiles = fs.readdirSync(directoryPath)
  console.log('all files', allFiles.join(', '))
  for (const filename of allFiles) {
    console.log(filename)
    const pagePath = path.join(directoryPath, filename)
    const fileStat = fs.statSync(pagePath)
    if (fileStat.isDirectory()) {
      if (filename === 'api' || filename === 'webhooks' || filename.indexOf('.') > -1) {
        continue
      }
      if (directoryPath.indexOf('application-server') > -1) {
        continue
      }
      scanHTMLPages(pagePath)
      continue
    }
    if (filename.startsWith('navbar') || !filename.endsWith('.html')) {
      console.log('skip', filename)
      continue
    }
    let urlPath = pagePath.substring(pagePath.indexOf('/src/www') + '/src/www'.length)
    if (urlPath.endsWith('.html')) {
      urlPath = urlPath.substring(0, urlPath.length - 5)
    }
    if (urlPath.endsWith('/index')) {
      urlPath = urlPath.substring(0, urlPath.length - '/index'.length)
      if (!urlPath) {
        urlPath = '/'
      }
    }
    if (pageIndex[urlPath]) {
      console.log('skip existing', filename)
      continue
    }
    console.log('index', pagePath)
    const pageHTML = fs.readFileSync(pagePath).toString()
    const jsFilePath = pagePath.replace('.html', '.js')
    let pageJS
    if (fs.existsSync(jsFilePath)) {
      pageJS = fs.readFileSync(jsFilePath).toString()
    }
    let title = pageHTML.substring(pageHTML.indexOf('<title>') + '<title>'.length)
    title = title = title.substring(0, title.indexOf('</title>'))
    if (title.indexOf('${') > -1) {
      title = title.replace('${', '')
      title = title.substring(0, title.indexOf('.'))
    }
    if (title.startsWith('View ')) {
      title = title.substring('View '.length)
    }
    for (const letter of alphabet) {
      title = title.split(letter).join(` ${letter}`)
    }
    title = title.trim()
    if (title.length) {
      title = title.substring(0, 1).toUpperCase() + title.substring(1)
    }
    let screenshotPath = urlPath
    if (exampleApp) {
      screenshotPath = `/${moduleName}${screenshotPath}`
    }
    let screenshotFolder = path.join(__dirname, 'screenshots' + screenshotPath)
    if (pagePath.endsWith('index.html')) {
      screenshotFolder += '/index'
      screenshotPath += '/index'
    }
    let screenshotFile
    if (fs.existsSync(screenshotFolder)) {
      const screenshots = fs.readdirSync(screenshotFolder)
      for (const screenshot of screenshots) {
        if (!screenshot.endsWith('desktop-en.png')) {
          continue
        }
        if (screenshot.indexOf('submit-form') > -1 || screenshot.indexOf('complete') > -1) {
          screenshotFile = screenshot
          break
        }
      }
    }
    const id = idNumber++
    const page = { title, urlPath, pageJS, pageHTML, screenshotPath: `/screenshots${screenshotPath}/${screenshotFile}`, id }
    const htmlTag = pageHTML.substring(0, pageHTML.indexOf('<head'))
    if (htmlTag.indexOf('navbar=') === -1) {
      page.detached = true
    }
    pageIndex[urlPath] = page
  }
}

function scanNavigationBars (directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    return
  }
  const allFiles = fs.readdirSync(directoryPath)
  const navbarFiles = []
  for (const file of allFiles) {
    if (file.startsWith('navbar') && file.endsWith('.html')) {
      navbarFiles.push(file)
    }
  }
  navbarFiles.sort(navbarThenPluralThenSingles)
  for (const filename of navbarFiles) {
    const filePath = path.join(directoryPath, filename)
    let urlPath = filePath.substring(filePath.indexOf('/src/www') + '/src/www'.length)
    urlPath = urlPath.replace('navbar-', '')
    urlPath = urlPath.substring(0, urlPath.length - 5)
    if (urlPath.endsWith('/navbar')) {
      urlPath = urlPath.substring(0, urlPath.length - '/navbar'.length)
    }
    if (urlPath === '/account/account' || urlPath === '/administrator/administrator') {
      urlPath = urlPath.substring(0, urlPath.lastIndexOf('/'))
    }
    let title
    if (!pageIndex[urlPath]) {
      title = urlPath.split('/').pop()
      title = title.substring(0, 1).toUpperCase() + title.substring(1)
    } else {
      title = pageIndex[urlPath].title
      if (title.startsWith('View ')) {
        title = title.substring('View '.length)
      }
      for (const letter of alphabet) {
        title = title.split(letter).join(` ${letter}`)
      }
      title = title.trim()
      if (title.length) {
        title = title.substring(0, 1).toUpperCase() + title.substring(1)
      }
    }
    let screenshotFolder = path.join(__dirname, 'screenshots' + urlPath)
    if (urlPath === `/account${uiPath}` || urlPath === `/administrator${uiPath}`) {
      screenshotFolder += '/index'
    }
    let screenshotPath
    if (fs.existsSync(screenshotFolder)) {
      const screenshots = fs.readdirSync(screenshotFolder)
      for (const screenshot of screenshots) {
        if (!screenshot.endsWith('desktop-en.png')) {
          continue
        }
        if (screenshot.indexOf('submit-form') > -1 || screenshot.indexOf('complete') > -1) {
          screenshotPath = screenshot
          break
        }
      }
    }
    const links = parseNavigationLinks(directoryPath, filename, urlPath)
    const object = { object: 'route', urlPath, links, title, screenshotPath: `/screenshots${urlPath}/${screenshotPath}` }
    navbars.push(object)
  }
  for (const filename of allFiles) {
    if (filename === 'api' || filename === 'webhooks' || filename.indexOf('.') > -1) {
      continue
    }
    const filePath = path.join(directoryPath, filename)
    const fileStat = fs.statSync(filePath)
    if (fileStat.isDirectory()) {
      scanNavigationBars(filePath)
    }
  }
}

function parseNavigationLinks (directoryPath, filename, urlPath) {
  const filePath = path.join(directoryPath, filename)
  if (!fs.existsSync(filePath)) {
    return []
  }
  const navbarHTML = fs.readFileSync(filePath).toString()
  if (!navbarHTML || !navbarHTML.length) {
    return []
  }
  const navigationLinks = HTML.parse(`<div>${navbarHTML}</div>`).getElementsByTagName('a')
  const links = []
  for (const link of navigationLinks) {
    if (!link.attr || !link.attr.href) {
      continue
    }
    if (link.attr.href === '/home' ||
      link.attr.href === '/account' ||
      link.attr.href === `/account${uiPath}` ||
      link.attr.href === '/administrator' ||
      link.attr.href === `/administrator${uiPath}` ||
      link.attr.href === `${urlPath}s`) {
      continue
    }
    let linkPath = link.attr.href
    const question = linkPath.indexOf('?')
    if (question > 0) {
      linkPath = linkPath.substring(0, question)
    }
    if (!pageIndex[linkPath] || linkPath === urlPath) {
      continue
    }
    let title = pageIndex[linkPath].title
    if (title.startsWith('View ')) {
      title = title.substring('View '.length)
    }
    for (const letter of alphabet) {
      title = title.split(letter).join(` ${letter}`)
    }
    title = title.trim()
    if (title.length) {
      title = title.substring(0, 1).toUpperCase() + title.substring(1)
    }
    const screenshotPath = pageIndex[linkPath].screenshotPath
    const id = pageIndex[linkPath].id
    const route = { object: 'route', urlPath: linkPath, title, id, links: [], screenshotPath }
    links.push(route)
  }
  return links
}

function navbarThenPluralThenSingles (a, b) {
  if (a === 'navbar.html') {
    return -1
  }
  if (b === 'navbar.html') {
    return 1
  }
  if (a.endsWith('s.html')) {
    return -1
  }
  if (b.endsWith('s.html')) {
    return 1
  }
}

function indexHomeThenDashboard (a, b) {
  if (a === '/home' || a === '/') {
    return 1
  }
  if (b === '/home' || b === '/') {
    return -1
  }
  return a < b ? 1 : 1
}
