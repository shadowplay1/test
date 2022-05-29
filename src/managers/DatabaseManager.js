const FetchManager = require('./FetchManager')

const DefaultConfiguration = require('../structures/DefaultConfiguration')
const errors = require('../structures/errors')

const EconomyError = require('../classes/util/EconomyError')
const Logger = require('../classes/util/Logger')


/**
 * Database manager methods class.
 */
class DatabaseManager {

    /**
     * Database Manager.
     * @param {Object} options Economy configuration.
     * @param {String} options.storagePath Full path to a JSON file. Default: './storage.json'.
     */
    constructor(options = {}) {
        const DotParser = require('../classes/util/DotParser')

        /**
         * Economy Logger.
         * @type {Logger}
         * @private
         */
        this._logger = new Logger(options)

        /**
         * Fetch manager methods object.
         * @type {FetchManager}
         * @private
         */
        this.fetcher = new FetchManager(options)

        /**
         * Full path to a JSON file.
         * @private
         * @type {String}
         */
        this.storagePath = options.storagePath || './storage.json'

        /**
         * Dot parser methods object.
         * @private
         * @type {DotParser}
         */
        this.parser = new DotParser(options)

        if (!options.storagePath) this.storagePath = DefaultConfiguration.storagePath
    }

    /**
     * Gets a list of keys in database.
     * @param {String} key The key in database.
     * @returns {String[]} An array with all keys in database or 'null' if nothing found.
     */
    keyList(key) {
        const storageData = this.all()
        const data = this.fetch(key)

        if (!key || typeof key !== 'string') return Object.keys(storageData).filter(key => storageData[key])
        if (data == null) return null

        const keys = Object.keys(data)
        return keys.filter(key => data[key] !== undefined && data[key] !== null)
    }

    /**
     * Sets data in a property in database.
     * @param {String} key The key in database.
     * @param {any} value Any data to set in property.
     * @param {Boolean} [debug=false] If true, debug log will be sent.
     * @returns {Boolean} If set successfully: true; else: false
     */
    set(key, value, debug) {
        if (!key) return false
        if (value == undefined) return false

        if (typeof key !== 'string') {
            throw new EconomyError(errors.databaseManager.invalidTypes.key + typeof data)
        }

        if (debug) this._logger.debug(`Performed "set" operation on key "${key}".`)

        return this.parser.set(key, value)
    }

    /**
     * Adds a number to a property data in database.
     * @param {String} key The key in database.
     * @param {Number} value Any number to add.
     * @returns {Boolean} If added successfully: true; else: false
     */
    add(key, value) {
        const data = this.parser.parse(key)

        if (!key) return false
        if (typeof key !== 'string') {
            throw new EconomyError(errors.databaseManager.invalidTypes.key + typeof data)
        }

        if (isNaN(value)) {
            throw new EconomyError(errors.databaseManager.invalidTypes.value.number + typeof value)
        }

        if (isNaN(data)) {
            throw new EconomyError(errors.databaseManager.invalidTypes.target.number + typeof data)
        }

        const numData = Number(data)
        const numValue = Number(value)

        this._logger.debug(`Performed "add" operation on key "${key}".`)
        return this.set(key, numData + numValue, false)
    }

    /**
     * Subtracts a number from a property data in database.
     * @param {String} key The key in database.
     * @param {Number} value Any number to subtract.
     * @returns {Boolean} If set successfully: true; else: false
     */
    subtract(key, value) {
        const data = this.parser.parse(key)

        if (!key) return false
        if (typeof key !== 'string') {
            throw new EconomyError(errors.databaseManager.invalidTypes.key + typeof data)
        }

        if (isNaN(value)) {
            throw new EconomyError(errors.databaseManager.invalidTypes.value.number + typeof value)
        }

        if (isNaN(data)) {
            throw new EconomyError(errors.databaseManager.invalidTypes.target.number + typeof data)
        }

        const numData = Number(data)
        const numValue = Number(value)

        this._logger.debug(`Performed "subtract" operation on key "${key}".`)
        return this.set(key, numData - numValue, false)
    }

    /**
     * Fetches the data from the storage file.
     * @param {String} key The key in database.
     * @returns {any} Value from the specified key or 'false' if failed to read or 'null' if nothing found.
     */
    fetch(key) {
        if (!key) return false
        if (typeof key !== 'string') {
            throw new EconomyError(errors.databaseManager.invalidTypes.key + typeof data)
        }

        return this.parser.parse(key)
    }

    /**
     * Fetches the data from the storage file.
     * 
     * This method is an alias for 'DatabaseManager.fetch()' method.
     * @param {String} key The key in database.
     * @returns {any} Value from the specified key or 'false' if failed to read or 'null' if nothing found.
     */
    get(key) {
        return this.fetch(key)
    }

    /**
     * Fetches the data from the storage file.
     * 
     * This method is an alias for the `DatabaseManager.fetch()` method.
     * @param {String} key The key in database.
     * @returns {any} Value from the specified key or 'false' if failed to read or 'null' if nothing found.
     */
    find(key) {
        return this.fetch(key)
    }

    /**
     * Removes the property from the existing object in database.
     * @param {String} key The key in database.
     * @returns {Boolean} If cleared: true; else: false.
     */
    remove(key) {
        if (!key) return false

        if (typeof key !== 'string') {
            throw new EconomyError(errors.databaseManager.invalidTypes.key + typeof data)
        }

        this._logger.debug(`Performed "delete" operation on key "${key}".`)
        return this.parser.remove(key)
    }

    /**
     * Removes the property from the existing object in database.
     * 
     * This method is an alias for `DatabaseManager.remove()` method.
     * @param {String} key The key in database.
     * @returns {Boolean} If cleared: true; else: false.
     */
    delete(key) {
        return this.remove(key)
    }

    /**
     * Pushes a value to a specified array from the database.
     * @param {String} key The key in database.
     * @param {any} value The key in database.
     * @returns {Boolean} If cleared: true; else: false.
     */
    push(key, value) {
        if (!key) return false
        if (value == undefined) return false

        if (typeof key !== 'string') {
            throw new EconomyError(errors.databaseManager.invalidTypes.key + typeof data)
        }

        const data = this.fetch(key) || []
        if (!Array.isArray(data) && !data.length) {
            throw new EconomyError(errors.databaseManager.invalidTypes.target.array + typeof data)
        }

        this._logger.debug(`Performed "push" operation on key "${key}".`)

        data.push(value)
        return this.set(key, data, false)
    }

    /**
     * Removes an element from a specified array in the database.
     * @param {String} key The key in database.
     * @param {Number} index The index in the array.
     * @returns {Boolean} If cleared: true; else: false.
     */
    removeElement(key, index) {
        if (!key) return false
        if (index == undefined) return false
        if (typeof key !== 'string') {
            throw new EconomyError(errors.databaseManager.invalidTypes.key + typeof data)
        }

        const data = this.fetch(key)
        if (!Array.isArray(data)) {
            throw new EconomyError(errors.databaseManager.invalidTypes.target.array + typeof data)
        }

        this._logger.debug(`Performed "removeElement" operation on key "${key}".`)

        data.splice(index, 1)
        return this.set(key, data, false)
    }

    /**
    * Changes the specified element's value in a specified array in the database.
    * @param {String} key The key in database.
    * @param {Number} index The index in the array.
    * @param {any} newValue The new value to set.
    * @returns {Boolean} If cleared: true; else: false.
    */
    changeElement(key, index, newValue) {
        if (!key) return false
        if (index == undefined) return false
        if (typeof key !== 'string') {
            throw new EconomyError(errors.databaseManager.invalidTypes.key + typeof data)
        }

        const data = this.fetch(key)
        if (!Array.isArray(data)) {
            throw new EconomyError(errors.databaseManager.invalidTypes.target.array + typeof data)
        }

        if (typeof key !== 'string') {
            throw new EconomyError(errors.databaseManager.invalidTypes.key + typeof data)
        }

        if (newValue == undefined) {
            throw new EconomyError(errors.databaseManager.invalidTypes.value.newValue + typeof newValue)
        }

        this._logger.debug(`Performed "changeElement" operation on key "${key}".`)

        data.splice(index, 1, newValue)
        return this.set(key, data, false)
    }

    /**
    * Checks if the element is existing in database.
    * @param {String} key The key in database.
    * @returns {Boolean} If existing: true; else: false.
    */
    has(key) {
        return !!this.fetch(key)
    }

    /**
     * Checks if the element is existing in database.
     * 
     * This method is an alias for `DatabaseManager.has()` method.
     * @param {String} key The key in database.
     * @returns {Boolean} If existing: true; else: false.
     */
    includes(key) {
        return this.has(key)
    }

    /**
    * Fetches the entire database.
    * @returns {Object} Database contents
    */
    all() {
        return this.fetcher.fetchAll()
    }
}

/**
 * Database manager class.
 * @type {DatabaseManager}
 */
module.exports = DatabaseManager