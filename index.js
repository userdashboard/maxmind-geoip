
module.exports = {
    setup: async () => {
      if (process.env.MAXMIND_GEOIP_STORAGE) {
        const Storage = require('@userdashboard/dashboard/src/storage.js')
        const storage = await Storage.setup('MAXMIND_GEOIP')
        const StorageList = require('@userdashboard/dashboard/src/storage-list.js')
        const storageList = await StorageList.setup(storage, 'MAXMIND_GEOIP')
        const StorageObject = require('@userdashboard/dashboard/src/storage-object.js')
        const storageObject = await StorageObject.setup(storage, 'MAXMIND_GEOIP')
        module.exports.Storage = storage
        module.exports.StorageList = storageList
        module.exports.StorageObject = storageObject
      } else {
        const dashboard = require('@userdashboard/dashboard')
        module.exports.Storage = dashboard.Storage
        module.exports.StorageList = dashboard.StorageList
        module.exports.StorageObject = dashboard.StorageObject
      }
    }
  }
  