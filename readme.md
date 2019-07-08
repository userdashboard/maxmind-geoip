# MaxMind GeoIP for Dashboard

[Dashboard](https://github.com/userdashboard/dashboard) is a NodeJS project that provides a reusable account management system for web applications.  This module adds [MaxMind GeoIP](https://maxmind.com) lookup and binds a Country object to each HttpRequest.

# Dashboard

Dashboard proxies your application server to create a single website where pages like signing in or changing your password are provided by Dashboard.  Your application server can be anything you want, and use Dashboard's API to access data as required.  Using modules you can expand Dashboard to include organizations, subscriptions powered by Stripe, or a Stripe Connect platform.

- [Introduction](https://github.com/userdashboard/dashboard/wiki)
- [Configuring Dashboard](https://github.com/userdashboard/dashboard/wiki/Configuring-Dashboard)
- [Dashboard code structure](https://github.com/userdashboard/dashboard/wiki/Dashboard-code-structure)
- [Server request lifecycle](https://github.com/userdashboard/dashboard/wiki/Server-Request-Lifecycle)

### Demonstrations

- [Dashboard](https://dashboard-demo-2344.herokuapp.com)
- [Dashboard + Organizations module](https://organizations-demo-7933.herokuapp.com)
- [Dashboard + Stripe Subscriptions module](https://stripe-subscriptions-5701.herokuapp.com)
- [Dashboard + Stripe Connect module](https://stripe-connect-8509.herokuapp.com)

## Access geoip information from your application server

| URL                                  | Method | Querystring  | POST data  |
|--------------------------------------|--------|--------------|------------|
|/api/user/maxmind/country             | GET    |              |            |

## Access geoip information from the dashboard server

| Method                                             | Querystring  | POST data  |
|----------------------------------------------------|--------------|------------|
|global.api.user.maxmind.Country.get(req)            |              |            |

## Dashboard modules

Additional APIs, content and functionality can be added by `npm install` and nominating Dashboard modules in your `package.json`.  You can read more about this on the [Dashboard configuration wiki page](https://github.com/userdashboard/dashboard/wiki/Configuring-Dashboard)

    "dashboard": {
      "modules": [ "package", "package2" ]
    }

Modules can supplement the global.sitemap with additional routes which automatically maps them into the `Private API` shared as global.api.

| Name | Description | Package   | Repository |
|------|-------------|-----------|------------|
| MaxMind GeoIP | IP address-based geolocation | @userdashboard/maxmind-geoip | [github](https://github.com/userdashboard/maxmind-geoip) |
| Organizations | User created groups | @userdashboard/organizations | [github](https://github.com/userdashboard/organizations) |
| Stripe Subscriptions | SaaS functionality | @userdashboard/stripe-subscriptions | [github](https://github.com/userdashboard/stripe-subscriptions) |
| Stripe Connect | Marketplace functionality | @userdashboard/stripe-connect | [github](https://github.com/userdashboard/stripe-connect)

#### Development

Development takes place on [Github](https://github.com/userdashboard/maxmind-geoip) with releases on [NPM](https://www.npmjs.com/package/@userdashboard/maxmind-geoip).

#### License

This is free and unencumbered software released into the public domain.  The MIT License is provided for countries that have not established a public domain.