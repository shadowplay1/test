const EconomyError = require('../util/EconomyError')
const errors = require('../../structures/errors')

const DatabaseManager = require('../../managers/DatabaseManager')
const FetchManager = require('../../managers/FetchManager')

const BaseManager = require('../../managers/BaseManager')

const HistoryItem = require('../HistoryItem')


/**
 * User purchases history class.
 */
class History extends BaseManager {
    constructor(memberID, guildID, options) {
        super(options, HistoryItem)

        /**
        * Member ID.
        * @type {String}
        */
        this.memberID = memberID

        /**
         * Guild ID.
         * @type {String}
         */
        this.guildID = guildID

        /**
         * Fetch Manager.
         * @type {FetchManager}
         * @private
         */
        this._fetcher = new FetchManager(options)

        /**
         * Database Manager.
         * @type {DatabaseManager}
         * @private
         */
        this.database = new DatabaseManager(options)
    }

    /**
    * Gets the item from user's purchases history.
    * @param {string | number} id History item ID.
    * @returns {HistoryItem} User's purchases history.
    */
    get(id) {
        return this.all().find(item => item.id == id)
    }

    /**
     * Gets all the items in user's purchases history.
     * @returns {HistoryItem[]} User's purchases history.
     */
    all() {
        const results = this.database.fetch(`${this.guildID}.${this.memberID}.history`) || []
        return results
    }

    /**
     * Adds the item from the shop to the purchases history.
     * @param {String | Number} id Shop item ID.
     * @returns {Boolean} If added: true, else: false.
     */
    add(itemID) {
        const shop = this.database.fetch(`${this.guildID}.shop`)
        const history = this.database.fetch(`${this.guildID}.${this.memberID}.history`)

        const item = shop.find(item => item.id == itemID || item.name == itemID)


        if (typeof itemID !== 'number' && typeof itemID !== 'string') {
            throw new EconomyError(errors.invalidTypes.editItemArgs.itemID + typeof itemID)
        }

        if (!item) return false

        return this.database.push(`${this.guildID}.${this.memberID}.history`, {
            id: history.length ? history[history.length - 1].id + 1 : 1,
            memberID: this.memberID,
            guildID: this.guildID,
            name: item.name,
            price: item.price,
            role: item.role || null,
            maxAmount: item.maxAmount,
            date: new Date().toLocaleString(this.options.dateLocale || 'en')
        })
    }

    /**
     * Removes the specified item from purchases history.
     * @param {String | Number} id History item ID.
     * @returns {Boolean} If removed: true, else: false.
     */
    remove(id) {
        if (typeof id !== 'number' && typeof id !== 'string') {
            throw new EconomyError(errors.invalidTypes.id + typeof id)
        }

        const history = this.fetch(memberID, guildID)
        const historyItem = this.find(id, memberID, guildID)

        const historyItemIndex = history.findIndex(histItem => histItem.id == historyItem.id)

        if (!historyItem) return false
        history.splice(historyItemIndex, 1)

        return this.database.set(`${this.guildID}.${this.memberID}.history`, history)
    }

    /**
     * Removes the specified item from purchases history.
     * 
     * This method is an alias for `EconomyUser.history.remove()` method.
     * @param {String | Number} id History item ID.
     * @returns {Boolean} If removed: true, else: false.
     */
    delete(id) {
        return this.remove(id)
    }

    /**
     * Clears the user's purchases history.
     * @returns {Boolean} If cleared: true, else: false.
     */
    clear() {
        const history = this.all()

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        if (!history) return false
        return this.database.remove(`${this.guildID}.${this.memberID}.history`)
    }

    /**
     * Searches for the specified item from history.
     * @param {String | Number} id History item ID.
     * @returns {HistoryItem} Purchases history item.
     */
    findItem(id) {
        return this.get(id)
    }

    /**
    * Searches for the specified item from history.
    * 
    * This method is an alias for the `EconomyUser.history.findItem()` method.
    * @param {String | Number} id History item ID.
    * @returns {HistoryItem} Purchases history item.
    */
    search(id) {
        return this.find(id)
    }

    /**
     * Shows the user's purchase history.
     * 
     * This method is an alias for the `EconomyUser.history.all()` method.
     * @returns {HistoryItem} User's purchase history.
     */
    fetch() {
        return this.all()
    }
}

/**
 * @typedef {Object} EconomyOptions Default Economy configuration.
 * @property {String} [storagePath='./storage.json'] Full path to a JSON file. Default: './storage.json'
 * @property {Boolean} [checkStorage=true] Checks the if database file exists and if it has errors. Default: true
 * @property {Number} [dailyCooldown=86400000] 
 * Cooldown for Daily Command (in ms). Default: 24 hours (60000 * 60 * 24 ms)
 * 
 * @property {Number} [workCooldown=3600000] Cooldown for Work Command (in ms). Default: 1 hour (60000 * 60 ms)
 * @property {Number | Number[]} [dailyAmount=100] Amount of money for Daily Command. Default: 100.
 * @property {Number} [weeklyCooldown=604800000] 
 * Cooldown for Weekly Command (in ms). Default: 7 days (60000 * 60 * 24 * 7 ms)
 * 
 * @property {Number | Number[]} [weeklyAmount=100] Amount of money for Weekly Command. Default: 1000.
 * @property {Number | Number[]} [workAmount=[10, 50]] Amount of money for Work Command. Default: [10, 50].
 * @property {Boolean} [subtractOnBuy=true] 
 * If true, when someone buys the item, their balance will subtract by item price. Default: false
 * 
 * @property {Number} [sellingItemPercent=75] 
 * Percent of the item's price it will be sold for. Default: 75.
 * 
 * @property {Boolean} [deprecationWarnings=true] 
 * If true, the deprecation warnings will be sent in the console. Default: true.
 * 
 * @property {Boolean} [savePurchasesHistory=true] If true, the module will save all the purchases history.
 * 
 * @property {Number} [updateCountdown=1000] Checks for if storage file exists in specified time (in ms). Default: 1000.
 * @property {String} [dateLocale='en'] The region (example: 'ru'; 'en') to format the date and time. Default: 'en'.
 * @property {UpdaterOptions} [updater=UpdaterOptions] Update checker configuration.
 * @property {ErrorHandlerOptions} [errorHandler=ErrorHandlerOptions] Error handler configuration.
 * @property {CheckerOptions} [optionsChecker=CheckerOptions] Configuration for an 'Economy.utils.checkOptions' method.
 * @property {Boolean} [debug=false] Enables or disables the debug mode.
 */

/**
 * User's purchases history class.
 * @type {History}
 */
module.exports = History