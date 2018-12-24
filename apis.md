# Documentation

## APIs

### Private / Public API (/src/www/api)

These NodeJS files are only accessible to dashboard modules and code running on your server.  They compose operations out of the `Internal API` and other parts of the `Private API` for user and administrator operations.  

The `Private API` returns JSON if you pass a HTTP request (or similar) object for internal usage or as HTTP endpoints if you enable public access to allow same-domain requests and pass a HTTP request and HTTP response.  When a HTTP response is included the API will output the JSON and end the request.

    // enable public access
    process.env.ALLOW_PUBLIC_API = true

    // retrieve an account 
    const API = require('@userappstore/dashboard-maxmind-geoip')
    const country = await API.maxmind.GeoIP.get(req)

| Method | HTTP VERBS | DESCRIPTION |
|--------|-------------|------------|
| `/api/user/geoip.js` | GET | Binds a country object to a request |
