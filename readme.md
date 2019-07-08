# MaxMind GeoIP for Dashboard

[Dashboard](https://github.com/userdashboard/dashboard) is a NodeJS project that provides a reusable account management system for web applications.  This module adds [MaxMind GeoIP](https://maxmind.com) lookup and binds a Country object to each HttpRequest.

## Access geoip information from your application server

| URL                                  | Method | Querystring  | POST data  |
|--------------------------------------|--------|--------------|------------|
|/api/user/maxmind/country             | GET    |              |            |

## Access geoip information from the dashboard server

| Method                                             | Querystring  | POST data  |
|----------------------------------------------------|--------------|------------|
|global.api.user.maxmind.Country.get(req)            |              |            |

# Dashboard

Dashboard is a NodeJS project that provides a reusable account management system for web applications. 

Dashboard proxies your application server to create a single website where pages like signing in or changing your password are provided by Dashboard.  Your application server can be anything you want, and use Dashboard's API to access data as required.

Using modules you can expand Dashboard to include organizations, subscriptions powered by Stripe, or a Stripe Connect platform.

Application servers written for Dashboard can be published on websites running our [app store](https://github.com/userdashboard/app-store-dashboard-server) software like [UserAppStore](https://userappstore.com).

- [Introduction](https://github.com/userdashboard/dashboard/wiki)
- [Configuring Dashboard](https://github.com/userdashboard/dashboard/wiki/Configuring-Dashboard)
- [Dashboard code structure](https://github.com/userdashboard/dashboard/wiki/Dashboard-code-structure)
- [Server request lifecycle](https://github.com/userdashboard/dashboard/wiki/Server-Request-Lifecycle)

### Demonstrations

- [Dashboard](https://dashboard-demo-2344.herokuapp.com)
- [Dashboard + Organizations module](https://organizations-demo-7933.herokuapp.com)
- [Dashboard + Stripe Subscriptions module](https://stripe-subscriptions-5701.herokuapp.com)
- [Dashboard + Stripe Connect module](https://stripe-connect-8509.herokuapp.com)

#### Development

Development takes place on [Github](https://github.com/userdashboard/maxmind-geoip) with releases on [NPM](https://www.npmjs.com/package/@userdashboard/maxmind-geoip).

#### License

This is free and unencumbered software released into the public domain.  The MIT License is provided for countries that have not established a public domain.