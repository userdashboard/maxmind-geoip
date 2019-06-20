# MaxMind GeoIP for Dashboard

[Dashboard](https://github.com/userappstore/dashboard) is a NodeJS project that provides a reusable account management system for web applications.  This module adds [MaxMind GeoIP](https://maxmind.com) lookup and binds a Country object to each HttpRequest.

## Access geoip information from your application server

| URL                                  | Method | Querystring  | POST data  |
|--------------------------------------|--------|--------------|------------|
|/api/user/maxmind/country             | GET    |              |            |

## Access geoip information from the dashboard server

| Method                                             | Querystring  | POST data  |
|----------------------------------------------------|--------------|------------|
|global.api.user.maxmind.Country.get(req)            |              |            |

#### License

This is free and unencumbered software released into the public domain.  The MIT License is provided for countries that have not established a public domain.