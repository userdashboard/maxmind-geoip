window.onload = function () {
  // on developer pages with code samples the code is highlighted
  var preTags = document.getElementsByTagName('pre')
  if (preTags && preTags.length) {
    for (var i = 0, len = preTags.length; i < len; i++) {
      var doc = preTags[i].firstElementChild.innerHTML
      doc = doc.split('&lt;').join('<')
      doc = doc.split('&gt;').join('>')
      doc = doc.split('&amp;').join('&')
      var language = preTags[i].firstElementChild.getAttribute('data-language')
      var highlighted
      if (!language || language === 'text') {
        highlighted = {
          value: doc
        }
      } else {
        highlighted = window.hljs.highlight(language, doc)
      }
      preTags[i].firstElementChild.innerHTML = highlighted.value
    }
  }
  // on pages with screenshot sequences links are added to switch
  // between different device renderings and some glue for the lightbox
  var screenshotElements = document.getElementsByClassName('desktop')
  if (screenshotElements && screenshotElements.length) {
    for (i = 0, len = screenshotElements.length; i < len; i++) {
      var screenshots = screenshotElements[i]
      if (!screenshots) {
        continue
      }
      var images = screenshots.getElementsByTagName('img')
      for (var j = 0, len = images.length; j < len; j++) {
        var image = images[j]
        if (!image.hasAttribute('data-src')) {
          image.setAttribute('data-src', image.src)
        }
        window.WAMediaBox.bind(image)
      }
      if (i > 0) {
        continue
      }
      var desktop = document.createElement('li')
      desktop.innerHTML = 'Computer'
      desktop.device = 'desktop'
      desktop.description = 'desktop'
      desktop.onclick = setDeviceScreenshot
      desktop.className = 'current'
      var largeTablet = document.createElement('li')
      largeTablet.innerHTML = 'Large tablet'
      largeTablet.onclick = setDeviceScreenshot
      largeTablet.device = 'ipad-pro'
      largeTablet.description = 'tablet-large'
      var smallTablet = document.createElement('li')
      smallTablet.innerHTML = 'Small tablet'
      smallTablet.onclick = setDeviceScreenshot
      smallTablet.device = 'ipad-mini'
      smallTablet.description = 'tablet-small'
      var largePhone = document.createElement('li')
      largePhone.innerHTML = 'Large phone'
      largePhone.onclick = setDeviceScreenshot
      largePhone.device = 'pixel-2-xl'
      largePhone.description = 'phone-large'
      var smallPhone = document.createElement('li')
      smallPhone.innerHTML = 'Small phone'
      smallPhone.onclick = setDeviceScreenshot
      smallPhone.device = 'iphone-se'
      smallPhone.description = 'phone-small'
      var devices = document.createElement('ul')
      devices.className = 'devices'
      var sitemap = document.getElementById('sitemap')
      if (sitemap) {
        var none = document.createElement('li')
        none.innerHTML = 'No screenshots'
        none.description = 'No screenshots'
        none.onclick = setNoScreenshot
        none.className = 'current'
        devices.appendChild(none)
        desktop.className = ''
      }
      devices.appendChild(desktop)
      devices.appendChild(largeTablet)
      devices.appendChild(smallTablet)
      devices.appendChild(largePhone)
      devices.appendChild(smallPhone)
      var settings = document.createElement('div')
      settings.appendChild(devices)
      screenshots.parentNode.insertBefore(settings, screenshots.previousSibling)
    }
  }
}

function setDeviceScreenshot (e) {
  var li = e.target
  var devices = document.getElementsByClassName('devices')[0]
  for (var i = 0, len = devices.children.length; i < len; i++) {
    devices.children[i].className = devices.children[i] === li ? 'current' : ''
  }
  var containers = document.getElementsByClassName('desktop')
  for (i = 0, len = containers.length; i < len; i++) {
    var screenshots = containers[i]
    if (!screenshots) {
      continue
    }
    var images = screenshots.getElementsByTagName('img')
    for (var j = 0, len = images.length; j < len; j++) {
      var image = images[j]
      var filename = image.src || image.getAttribute('data-src')
      for (var k = 0, kLen = devices.children.length; k < kLen; k++) {
        if (!devices.children[k].device) {
          continue
        }
        var deviceFile = devices.children[k].device.split(' ').join('-')
        var index = filename.lastIndexOf('-' + deviceFile)
        if (index > -1) {
          filename = filename.substring(0, index)
          break
        }
      }
      filename += '-' + li.device + '.png'
      image.src = filename
      image.style.display = 'block'
      window.WAMediaBox.bind(image)
    }
  }
  e.preventDefault()
  return false
}

function setNoScreenshot (e) {
  var li = e.target
  var devices = document.getElementsByClassName('devices')[0]
  for (var i = 0, len = devices.children.length; i < len; i++) {
    devices.children[i].className = devices.children[i] === li ? 'current' : ''
  }
  var containers = document.getElementsByClassName('desktop')
  for (i = 0, len = containers.length; i < len; i++) {
    var screenshots = containers[i]
    var images = screenshots.getElementsByTagName('img')
    for (var j = 0, len = images.length; j < len; j++) {
      var image = images[j]
      image.style.display = 'none'
    }
  }
  e.preventDefault()
  return false
}
