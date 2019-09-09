const maxmind = require('maxmind')
const path = require('path')
let db

module.exports = {
  auth: false,
  get: async (req) => {
    if (!req.query || !req.query.ip) {
      throw new Error('invalid-ip')
    }
    db = db || maxmind.openSync(path.join(__dirname, '../../../../GeoLite2-Country.mmdb'))
    if (process.env.NODE_ENV === 'testing' && req.query.ip === '127.0.0.1') {
      req.query.ip = '8.8.8.8'
    }
    const country = db.get(req.query.ip)
    if (country === null) {
      throw new Error('invalid-ip')
    }
    return country
  }
}
