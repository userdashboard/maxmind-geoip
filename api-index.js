const beautify = require('js-beautify').html
const fs = require('fs')
const path = require('path')
const HTML = require('@userdashboard/dashboard/src/html.js')
const template = fs.readFileSync('./api-index-template.html').toString()
const moduleName = process.argv[2]
const rootPath = process.argv[3]
let apiPath
if (moduleName === 'dashboard') {
  apiPath = ''
} else if (moduleName === 'organizations') {
  apiPath = moduleName
} else if (moduleName === 'maxmind-geoip') {
  apiPath = 'maxmind'
} else {
  apiPath = moduleName === 'stripe-connect' ? 'connect' : 'subscriptions'
}
// let userDir, administratorDir
// if (moduleName === 'dashboard') {
//   userDir = path.join(rootPath, `${moduleName}/src/www/api/user`)
//   administratorDir = path.join(rootPath, `${moduleName}/src/www/api/administrator`)
// } else {
//   userDir = path.join(rootPath, `node_modules/@userdashboard/${moduleName}/src/www/api/user/${apiPath}`)
//   administratorDir = path.join(rootPath, `node_modules/@userdashboard/${moduleName}/src/www/api/administrator/${apiPath}`)
// }
const userDir = path.join(rootPath, `node_modules/@userdashboard/${moduleName}/src/www/api/user/${apiPath}`)
const administratorDir = path.join(rootPath, `node_modules/@userdashboard/${moduleName}/src/www/api/administrator/${apiPath}`)

const files = []
const userFiles = fs.readdirSync(userDir)
const administratorFiles = moduleName !== 'maxmind-geoip' ? fs.readdirSync(administratorDir) : []
for (const file of userFiles) {
  files.push(userDir + '/' + file)
}
for (const file of administratorFiles) {
  files.push(administratorDir + '/' + file)
}
const index = {}
for (const filePath of files) {
  if (!filePath.endsWith('.test.js')) {
    continue
  }
  const lines = fs.readFileSync(filePath).toString().split('\n')
  const structure = {}
  // index *.test.js to JSON
  let currentArray, currentSegment, newFilePath
  for (const line of lines) {
    if (line.indexOf('describe(') === -1 && line.indexOf(' it(') === -1) {
      continue
    }
    if (line.indexOf('/api/') > -1) {
      newFilePath = line.substring(line.indexOf('/api'))
      newFilePath = newFilePath.substring(0, newFilePath.indexOf("'"))
      continue
    }
    if (!newFilePath) {
      break
    }
    // this is only necessary until subscriptions & connect modules are finished updating
    if (line.indexOf('#GET') > -1 || line.indexOf('#POST') > -1 || line.indexOf('#PATCH') > -1 || line.indexOf('#DELETE') > -1) {
      continue
    }
    if (line.indexOf('#get') > -1 || line.indexOf('#post') > -1 || line.indexOf('#patch') > -1 || line.indexOf('#delete') > -1) {
      continue
    }
    if (line.indexOf('describe(') > -1) {
      if (line.indexOf('describe(\'exceptions') > -1) {
        currentSegment = 'exceptions'
        currentArray = structure.exceptions = {}
      } else if (line.indexOf('describe(\'receives') > -1) {
        currentArray = structure.receives = []
        currentSegment = 'receives'
      } else if (line.indexOf('describe(\'returns') > -1) {
        currentArray = structure.returns = []
        currentSegment = 'returns'
      } else if (line.indexOf('describe(\'configuration') > -1) {
        currentArray = structure.configuration = []
        currentSegment = 'configuration'
      } else if (line.indexOf('describe(\'redacts') > -1) {
        currentArray = structure.redacts = []
        currentSegment = 'redacts'
      } else {
        let type = line.substring(line.indexOf('describe(\'') + 10)
        type = type.substring(0, type.indexOf("'"))
        currentArray = structure[currentSegment][type] = []
      }
      continue
    }
    if (!currentArray || !currentArray.push) {
      continue
    }
    let description = line.substring(line.indexOf("it('") + 4)
    description = description.substring(0, description.indexOf("'"))
    currentArray.push(description)
  }

  if (!currentArray) {
    // this is only necessary until subscriptions module is finished updating
    continue
  }

  const fileDescription = newFilePath
  let verb
  if (fileDescription.indexOf('create-') > -1) {
    verb = 'POST'
  } else if (fileDescription.indexOf('delete-') > -1) {
    verb = 'DELETE'
  } else if (fileDescription.indexOf('update-') > -1 || fileDescription.indexOf('set-') > -1 || fileDescription.indexOf('reset-') > -1) {
    verb = 'PATCH'
  } else {
    verb = 'GET'
  }
  index[fileDescription] = { verb, structure, fileDescription }
}

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
global.rootPath = __dirname
global.applicationPath = __dirname
const doc = HTML.parse(template)
doc.getElementById('title').child = [{
  node: 'text',
  text: `${title} API index`
}]
doc.getElementsByTagName('title')[0].child = [{
  node: 'text',
  text: `${title} API index`
}]
const navbarTemplate = doc.getElementById('navbar')
if (navbarTemplate) {
  doc.getElementById('side-navigation').child = navbarTemplate.child
  navbarTemplate.parentNode.removeChild(navbarTemplate)
}
const userRoutes = []
const administratorRoutes = []
for (const url in index) {
  let nodejs = 'global' + url.split('/').join('.')
  const parts = nodejs.split('.').pop().split('-')
  nodejs = nodejs.substring(0, nodejs.lastIndexOf('.') + 1)
  for (const i in parts) {
    nodejs += parts[i].charAt(0).toUpperCase() + parts[i].substring(1)
  }
  const urlParameters = []
  const postParameters = []
  if (index[url].structure.receives && index[url].structure.receives.length) {
    for (const parameter of index[url].structure.receives) {
      let truncated = parameter
      if (truncated.indexOf(' (') > -1) {
        truncated = truncated.substring(0, truncated.indexOf(' ('))
      }
      if (parameter.indexOf('posted') > -1) {
        postParameters.push({
          object: 'parameter',
          name: truncated.substring(truncated.lastIndexOf(' ') + 1)
        })
      } else {
        urlParameters.push({
          object: 'parameter',
          name: truncated.substring(truncated.lastIndexOf(' ') + 1)
        })
      }
    }
  }
  urlParameters.sort()
  postParameters.sort()
  const data = url.indexOf('/administrator/') > -1 ? administratorRoutes : userRoutes
  data.push({
    object: 'route',
    id: administratorRoutes.length + userRoutes.length,
    verb: index[url].verb,
    nodejs,
    url,
    urlParameters,
    postParameters
  })
}
const removeList = []
if (userRoutes && userRoutes.length) {
  console.log('rendering routes', userRoutes)
  HTML.renderTable(doc, userRoutes, 'route-row-template', 'user-routes-table')
} else {
  removeList.push('user-container')
}
if (administratorRoutes && administratorRoutes.length) {
  HTML.renderTable(doc, administratorRoutes, 'route-row-template', 'administrator-routes-table')
} else {
  removeList.push('administrator-container')
}
for (const route of userRoutes.concat(administratorRoutes)) {
  if (route.urlParameters && route.urlParameters.length) {
    HTML.renderList(doc, route.urlParameters, 'parameter-item-template', `url-parameters-${route.id}`)
  } else {
    removeList.push(`url-parameters-${route.id}`)
  }
  if (route.postParameters && route.postParameters.length) {
    HTML.renderList(doc, route.postParameters, 'parameter-item-template', `post-parameters-${route.id}`)
  } else {
    removeList.push(`post-parameters-${route.id}`)
  }
}

for (const id of removeList) {
  const element = doc.getElementById(id)
  element.parentNode.removeChild(element)
}

createFolderSync(apiPath.substring(0, apiPath.lastIndexOf('/')))
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
