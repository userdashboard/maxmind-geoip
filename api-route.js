const beautify = require('js-beautify').html
const fs = require('fs')
const path = require('path')
const HTML = require('@userdashboard/dashboard/src/html.js')
const template = fs.readFileSync('./api-route-template.html').toString()
const moduleName = process.argv[2]
const filePath = process.argv[3]
console.log('api route', moduleName, filePath)
const lines = fs.readFileSync(filePath).toString().split('\n')
const structure = {}

// convert *.test.js to JSON
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
    continue
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
  process.exit(0)
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
global.rootPath = __dirname
global.applicationPath = __dirname
const doc = HTML.parse(template)
doc.getElementById('title').child = [{
  node: 'text',
  text: `${fileDescription} (${verb})`
}]
doc.getElementsByTagName('title')[0].child = [{
  node: 'text',
  text: `${fileDescription}#${verb} (${moduleName})`
}]
const segments = ['exceptions', 'receives', 'redacts', 'configuration']
for (const segment of segments) {
  if (segment === 'receives') {
    const data = []
    if (structure[segment] && structure[segment].length) {
      for (const listItem of structure[segment]) {
        if (segment === 'receives') {
          let required
          if (listItem.indexOf('optionally-required') > -1) {
            required = 'configurable as required'
          } else {
            required = listItem.indexOf('optional') > -1 ? 'optional' : 'required'
          }
          const type = listItem.indexOf('posted') > -1 ? 'POST' : 'URL'
          let variable = type === 'POST' ? listItem.split('posted ').pop() : listItem.split('querystring ').pop()
          let value = variable.indexOf('(') > -1 ? variable.substring(variable.indexOf('(') + 1) : 'string'
          if (value.indexOf(')') > -1) {
            value = value.substring(0, value.indexOf(')'))
          }
          if (value.indexOf('|') > -1) {
            value = value.split('|').join(', ')
          }
          if (variable.indexOf('(') > -1) {
            variable = variable.substring(0, variable.indexOf('('))
          }
          data.push({
            object: 'property',
            variable,
            value,
            required,
            type
          })
        }
      }
      HTML.renderTable(doc, data, `${segment}-row-template`, segment)
    } else {
      const receivesContainer = doc.getElementById('receives-container')
      receivesContainer.parentNode.removeChild(receivesContainer)
    }
  } else if (segment === 'redacted') {
    const data = []
    for (const item in structure[segment]) {
      for (const i in structure[segment][item]) {
        data.push({
          object: 'property',
          name: structure[segment][item][i]
        })
      }
    }
    HTML.renderList(doc, data, `${segment}-row-template`, segment)
  } else if (segment === 'exceptions') {
    let id = 0
    for (const item in structure[segment]) {
      const exceptions = []
      for (const i in structure[segment][item]) {
        if (i === '0') {
          exceptions.push({
            id: id++,
            object: 'exception',
            text: item,
            note: structure[segment][item][0],
            rowSpan: structure[segment][item].length
          })
        } else {
          exceptions.push({
            id: id++,
            object: 'exception',
            note: structure[segment][item][i]
          })
        }
      }
      if (exceptions && exceptions.length) {
        HTML.renderTable(doc, exceptions, 'exception-template', segment)
        for (const exception of exceptions) {
          if (exception.text) {
            continue
          }
          const description = doc.getElementById(`description-${exception.id}`)
          description.parentNode.removeChild(description)
        }
      }
    }
  } else {
    const container = doc.getElementById(`${segment}-container`)
    if (container) {
      container.parentNode.removeChild(container)
    }
  }
}
const isAdministrator = process.argv[2].indexOf('/administrator') > -1
newFilePath = path.join(process.env.DOCUMENTATION_PATH || __dirname, 'api')
if (!fs.existsSync(newFilePath)) {
  fs.mkdirSync(newFilePath)
}
newFilePath = path.join(process.env.DOCUMENTATION_PATH || __dirname, 'api/' + (isAdministrator ? 'administrator' : 'user'))
if (!fs.existsSync(newFilePath)) {
  fs.mkdirSync(newFilePath)
}
if (moduleName === 'maxmind-geoip') {
  newFilePath += '/maxmind'
} else if (moduleName === 'stripe-connect') {
  newFilePath += '/connect'
} else if (moduleName === 'stripe-subscriptions') {
  newFilePath += '/subscriptions'
} else if (moduleName === 'organizations') {
  newFilePath += '/organizations'
}
if (!fs.existsSync(newFilePath)) {
  fs.mkdirSync(newFilePath)
}
let nodejs = 'global' + fileDescription.split('/').join('.')
const parts = nodejs.split('.').pop().split('-')
nodejs = nodejs.substring(0, nodejs.lastIndexOf('.') + 1)
for (const i in parts) {
  nodejs += parts[i].charAt(0).toUpperCase() + parts[i].substring(1)
}
doc.getElementById('nodejs').classList.add(verb.toLowerCase())
doc.getElementById('nodejs').child = [{
  node: 'text',
  text: 'await ' + nodejs + '.' + verb.toLowerCase() + '(req)'
}]
doc.getElementById('source').child = [{
  node: 'text',
  text: fs.readFileSync(filePath.replace('.test.js', '.js')).toString()
}]
doc.getElementById('returns').child = [{
  node: 'text',
  text: structure.returns
}]
const responseFileName = '/' + filePath.split('/').pop() + 'on'
if (fs.existsSync(newFilePath + responseFileName)) {
  const response = doc.getElementById('response')
  let responseJSON = fs.readFileSync(newFilePath + responseFileName).toString()
  if (responseJSON.indexOf('{') > -1) {
    responseJSON = JSON.parse(responseJSON)
    for (const field in responseJSON) {
      if (responseJSON[field] + 1 > 1578154662) {
        responseJSON[field] = '{timestamp}'
      }
    }
    response.child = [{
      node: 'text',
      text: JSON.stringify(responseJSON, null, '  ')
    }]
  } else {
    response.parentNode.parentNode.parentNode.removeChild(response.parentNode.parentNode)
  }
}
doc.getElementById('tests').child = [{
  node: 'text',
  text: fs.readFileSync(filePath).toString()
}]
doc.getElementById('github_source').attr.href = `https://github.com/userdashboard/${moduleName}/tree/master/src/www${fileDescription}.js`
doc.getElementById('github_tests').attr.href = `https://github.com/userdashboard/${moduleName}/tree/master/src/www${fileDescription}.test.js`
const navbarTemplate = doc.getElementById('navbar')
doc.getElementById('side-navigation').child = navbarTemplate.child
navbarTemplate.parentNode.removeChild(navbarTemplate)

const filename = filePath.split('/').pop().replace('.test.js', '.html')
createFolderSync(newFilePath)
const html = beautify(doc.toString(), { indent_size: 2, space_in_empty_paren: true })
fs.writeFileSync(`${newFilePath}/${filename}`, html)

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
