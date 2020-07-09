const beautify = require('js-beautify').html
const fs = require('fs')
const path = require('path')
const HTML = require('@userdashboard/dashboard/src/html.js')
const template = fs.readFileSync('./ui-routes-template.html').toString()
const moduleName = process.argv[2]
let idNumber = 0

let indexPath, moduleTitle
if (moduleName === 'example-web-app') {
  moduleTitle = 'Example web app'
  indexPath = `${moduleName}-ui`
} else if (moduleName === 'example-subscription-web-app') {
  moduleTitle = 'Example subscription web app'
  indexPath = `/${moduleName}-ui`
}

const imagePath = `screenshots/${moduleName}`
const containerPath = path.join(process.env.DOCUMENTATION_PATH || __dirname, imagePath)
if (!fs.existsSync(containerPath)) {
  process.exit(0)
}
const demonstrations = fs.readdirSync(containerPath)
const containerData = []
for (const folderPath of demonstrations) {
  if (folderPath === 'account' || folderPath === 'administrator') {
    continue
  }
  const filenameParts = folderPath.split('-')
  let description = ''
  for (const part of filenameParts) {
    if (part === 'desktop-en.png') {
      break
    }
    if (description !== '') {
      description += ' ' + part
    } else {
      description += part.charAt(0).toUpperCase() + part.substring(1)
    }
  }
  description = description.trim()
  const screenshots = fs.readdirSync(containerPath + '/' + folderPath)
  screenshots.sort(sortByNumericPrefix)
  const screenshotData = []
  for (const screenshot of screenshots) {
    if (screenshot.indexOf('desktop-en.png') === -1) {
      continue
    }
    const filenameParts = screenshot.split('-')
    let description = ''
    for (const part of filenameParts) {
      if (part === 'desktop-en.png') {
        break
      }
      if (description === '') {
        description = part + '.  '
        continue
      }
      description += ' ' + part.charAt(0).toUpperCase() + part.substring(1)
    }
    description = description.trim()
    screenshotData.push({
      object: 'screenshot',
      urlPath: `/${imagePath}/${folderPath}/${screenshot}`,
      description: description.trim()
    })
  }
  containerData.push({
    object: 'screenshots',
    description,
    screenshots: screenshotData,
    id: idNumber++
  })
}
global.rootPath = __dirname
global.applicationPath = __dirname
const doc = HTML.parse(template)
doc.getElementById('title').child = [{
  node: 'text',
  text: moduleTitle + ' UI indexs'
}]
doc.getElementsByTagName('title')[0].child = [{
  node: 'text',
  text: `"${moduleTitle} UI indexs`
}]
const navbarTemplate = doc.getElementById('navbar')
doc.getElementById('side-navigation').child = navbarTemplate.child
navbarTemplate.parentNode.removeChild(navbarTemplate)
if (containerData.length) {
  HTML.renderList(doc, containerData, 'container-template', 'screenshots-container')
  for (const route of containerData) {
    if (route.screenshots && route.screenshots.length) {
      HTML.renderList(doc, route.screenshots, 'screenshot-template', `screenshots-${route.id}`)
    }
  }
}

const html = beautify(doc.toString(), { indent_size: 2, space_in_empty_paren: true })
fs.writeFileSync(`${process.env.DOCUMENTATION_PATH || '.'}/${indexPath}.html`, html)

function sortByNumericPrefix (a, b) {
  const aNumber = parseInt(a.split('-')[0])
  const bNumber = parseInt(b.split('-')[0])
  return aNumber > bNumber ? 1 : -1
}
