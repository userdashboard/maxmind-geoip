const maxmind = require('maxmind')
const path = require('path')
let defaultCountry
let db

module.exports = {
  auth: false,
  get: async (req) => {
    db = db || maxmind.openSync(path.join(__dirname, '../../../../GeoLite2-Country.mmdb'))
    defaultCountry = defaultCountry || db.get('8.8.8.8')
    return db.get(req.ip) || defaultCountry
  }
}
