# Documentation for Maxmind GeoIP module

#### Index

- [Introduction](#maxmind-geoip-module)
- [Module contents](#module-contents)
- [Import this module](#import-this-module)
- [Access the API](#access-the-api)
- [Github repository](https://github.com/userdashboard/maxmind-geoip)
- [NPM package](https://npmjs.org/userdashboard/maxmind-geoip)

# Introduction

Dashboard bundles everything a web app needs, all the "boilerplate" like signing in and changing passwords, into a parallel server so you can write a much smaller web app.

[MaxMind](https://www.maxmind.com/en/home) provide a database that converts IP addresses to countries and this module adds API routes for identifying the country by IP and a server handler that will automatically attach a Country object to each HttpRequest using their database.  There is much more data in the MaxMind database than is exposed via the API, pull requests are welcome to add more routes to access it. 

# Module contents 

Dashboard modules can add pages and API routes.  For more details check the `sitemap.txt` and `api.txt` or the online documentation.

| Content type             |     |
|--------------------------|-----|
| Proxy scripts            |     |
| Server scripts           | Yes |
| Content scripts          |     |
| User pages               |     |
| User API routes          | Yes | 
| Administrator pages      |     |
| Administrator API routes |     | 

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

Dashboard and official modules are completely API-driven and you can access the same APIs on behalf of the user making requests.  You perform `GET`, `POST`, `PATCH`, and `DELETE` HTTP requests against the API endpoints to fetch or modify data.  This example fetches the user's country information using NodeJS, you can do this with any language:

    const country = await proxy(`/api/user/maxmind/country?ip=1.2.3.4`, accountid, sessionid)

    const proxy = util.promisify((path, accountid, sessionid, callback) => {
        const requestOptions = {
            host: 'dashboard.example.com',
            path: path,
            port: '443',
            method: 'GET',
            headers: {
                'x-application-server': 'application.example.com',
                'x-application-server-token': process.env.APPLICATION_SERVER_TOKEN
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


