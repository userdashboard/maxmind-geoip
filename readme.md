# MaxMind GeoIP module for Dashboard
![StandardJS](https://github.com/userdashboard/maxmind-geoip/workflows/standardjs/badge.svg) ![Test suite](https://github.com/userdashboard/maxmind-geoip/workflows/test-user-api/badge.svg)

Dashboard bundles everything a web app needs, all the "boilerplate" like signing in and changing passwords, into a parallel server so you can write a much smaller web app.

[MaxMind](https://www.maxmind.com/en/home) provide a database that converts IP addresses to countries or other information.  This module for [Dashboard](https://github.com/userdashboard/dashboard) adds API routes for identifying the country by IP and a server handler that will binds a Country object to each HttpRequest.

There is much more data in the MaxMind database than is exposed via the API, pull requests are welcome to add more routes to access it.  

Environment configuration variables are documented in `start-dev.sh`.  You can view API documentation in `api.txt`, or in more detail on the [documentation site](https://userdashboard.github.io/).  Join the freenode IRC #userdashboard chatroom for support - [Web IRC client](https://kiwiirc.com/nextclient/).

## Import this module

Install the module with NPM:

    $ npm install @userdashboard/maxmind-geoip

Edit your `package.json` to activate the module:

    "dashboard": {
      "modules": [
        "@userdashboard/maxmind-geoip"
      ]
    }

## Access the API

Use the API to identify which country a user is from, proxying your Dashboard server API from your application server:

    const country = await proxy(`/api/user/maxmind/country?ip=1.2.3.4`, accountid, sessionid)

    const proxy = util.promisify((path, accountid, sessionid, callback) => {
        let hashText
        if (accountid) {
            hashText = `${process.env.APPLICATION_SERVER_TOKEN}/${accountid}/${sessionid}`
        } else {
            hashText = process.env.APPLICATION_SERVER_TOKEN
        }
        const salt = bcrypt.genSaltSync(4)
        const token = bcrypt.hashSync(hashText, salt)
        const requestOptions = {
            host: 'dashboard.example.com',
            path: path,
            port: '443',
            method: 'GET',
            headers: {
                'x-application-server': 'application.example.com',
                'x-dashboard-token': token
            }
        }
        if (accountid) {
            requestOptions.headers['x-accountid'] = accountid
            requestOptions.headers['x-sessionid'] = sessionid
        }
        const proxyRequest = require('https').request(requestOptions, (proxyResponse) => {
            let body = ''
            proxyResponse.on('data', (chunk) => {
                body += chunk
            })
            return proxyResponse.on('end', () => {
                return callback(null, JSON.parse(body))
            })
        })
        proxyRequest.on('error', (error) => {
            return callback(error)
        })
        return proxyRequest.end()
      })
    }


