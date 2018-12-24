const maxmind = require('maxmind')
const path = require('path')
let db

module.exports = {
  auth: false,
  get: async (req) => {
    db = db || maxmind.openSync(path.join(__dirname, '../../../../GeoLite2-Country.mmdb'))
    if (process.env.NODE_ENV === 'testing' && req.ip === '127.0.0.1') {
      req.ip = '8.8.8.8'
    }
    return db.get(req.ip)
  }
}
