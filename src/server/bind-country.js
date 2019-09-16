module.exports = {
  before: async (req) => {
    const queryWas = req.query
    req.query = {
      ip: req.ip || requestIPAddress(req)
    }
    req.country = await global.api.user.maxmind.Country.get(req)
    req.query = queryWas
  }
}

function requestIPAddress (req) {
  const xForwardFor = req.headers['x-forwarded-for']
  if (xForwardFor) {
    const comma = xForwardFor.indexOf(',')
    if (comma > -1) {
      return xForwardFor.substring(0, comma)
    }
    return xForwardFor
  }
  if (req.connection) {
    if (req.connection.remoteAddress) {
      return req.connection.remoteAddress
    } else if (req.connection.socket) {
      return req.connection.socket
    }
  }
  if (req.socket && req.socket.remoteAddress) {
    return req.socket.remoteAddress
  }
}
