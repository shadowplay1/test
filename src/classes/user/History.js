const EconomyError = require('../util/EconomyError')
const errors = require('../../structures/errors')

const DatabaseManager = require('../../managers/DatabaseManager')
const BaseManager = require('../../managers/BaseManager')

const HistoryItem = require('../HistoryItem')


/**
 * User purchases history class.
 * @extends {BaseManager}
 */
class History extends BaseManager {

    /**
     * History constructor.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @param {EconomyOptions} options Economy configuration.
     * @param {DatabaseManager} database Database Manager.
     */
    constructor(memberID, guildID, options, database) {
        super(options, memberID, guildID, HistoryItem)

        /**
        * Member ID.
        * @type {string}
        */
        this.memberID = memberID

        /**
         * Guild ID.
         * @type {string}
         */
        this.guildID = guildID

        /**
         * Database Manager.
         * @type {DatabaseManager}
         * @private
         */
        this.database = database
    }

    /**
    * Gets the item from user's purchases history.
    * @param {string | number} id History item ID.
    * @returns {Promise<HistoryItem>} User's purchases history.
    */
    async get(id) {
        const allHistory = await this.all()
        return allHistory.find(item => item.id == id)
    }

    /**
     * Gets all the items in user's purchases history.
     * @returns {Promise<HistoryItem[]>} User's purchases history.
     */
    async all() {
        const results = await this.database.fetch(`${this.guildID}.${this.memberID}.history`) || []

        return results.map(
            historyItem =>
                new HistoryItem(this.guildID, this.memberID, this.options, historyItem, this.database)
        )
    }

    /**
     * Adds the item from the shop to the purchases history.
     * @param {string | number} itemID Shop item ID.
     * @returns {Promise<boolean>} If added: true, else: false.
     */
    async add(itemID) {
        const shop = await this.database.fetch(`${this.guildID}.shop`)
        const history = await this.database.fetch(`${this.guildID}.${this.memberID}.history`)

        const item = shop.find(item => item.id == itemID || item.name == itemID)


        if (typeof itemID !== 'number' && typeof itemID !== 'string') {
            throw new EconomyError(errors.invalidTypes.editItemArgs.itemID + typeof itemID)
        }

        if (!item) return false

        const result = await this.database.push(`${this.guildID}.${this.memberID}.history`, {
            id: history.length ? history[history.length - 1].id + 1 : 1,
            memberID: this.memberID,
            guildID: this.guildID,
            name: item.name,
            price: item.price,
            role: item.role || null,
            maxAmount: item.maxAmount,
            date: new Date().toLocaleString(this.options.dateLocale || 'en')
        })

        return result
    }

    /**
     * Removes the specified item from purchases history.
     * @param {string | number} id History item ID.
     * @returns {Promise<boolean>} If removed: true, else: false.
     */
    async remove(id) {
        if (typeof id !== 'number' && typeof id !== 'string') {
            throw new EconomyError(errors.invalidTypes.id + typeof id)
        }

        const history = (await this.fetch(memberID, guildID)) || []

        const historyItem = await this.find(
            historyItem =>
                historyItem.id == id &&
                historyItem.memberID == memberID &&
                historyItem.guildID == guildID
        )

        const historyItemIndex = history.findIndex(histItem => histItem.id == historyItem.id)

        if (!historyItem) return false
        history.splice(historyItemIndex, 1)

        const result = await this.database.set(`${this.guildID}.${this.memberID}.history`, history)
        return result
    }

    /**
     * Removes the specified item from purchases history.
     * 
     * This method is an alias for `History.remove()` method.
     * @param {string | number} id History item ID.
     * @returns {Promise<boolean>} If removed: true, else: false.
     */
    delete(id) {
        return this.remove(id)
    }

    /**
     * Clears the user's purchases history.
     * @returns {Promise<boolean>} If cleared: true, else: false.
     */
    async clear() {
        const history = await this.all()

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        if (!history) return false

        const result = await this.database.remove(`${this.guildID}.${this.memberID}.history`)
        return result
    }

    /**
     * Searches for the specified item from history.
     * @param {string | number} id History item ID.
     * @returns {Promise<HistoryItem>} Purchases history item.
     */
    findItem(id) {
        return this.get(id)
    }

    /**
    * Searches for the specified item from history.
    * 
    * This method is an alias for the `History.findItem()` method.
    * @param {string | number} id History item ID.
    * @returns {Promise<HistoryItem>} Purchases history item.
    */
    search(id) {
        return this.find(id)
    }

    /**
     * Shows the user's purchase history.
     * 
     * This method is an alias for the `History.all()` method.
     * @returns {Promise<HistoryItem>} User's purchase history.
     */
    fetch() {
        return this.all()
    }
}

/**
 * @typedef {object} EconomyOptions Default Economy configuration.
 * @property {string} [storagePath='./storage.json'] Full path to a JSON file. Default: './storage.json'
 * @property {boolean} [checkStorage=true] Checks the if database file exists and if it has errors. Default: true
 * @property {number} [dailyCooldown=86400000] 
 * Cooldown for Daily Command (in ms). Default: 24 hours (60000 * 60 * 24 ms)
 * 
 * @property {number} [workCooldown=3600000] Cooldown for Work Command (in ms). Default: 1 hour (60000 * 60 ms)
 * @property {Number | Number[]} [dailyAmount=100] Amount of money for Daily Command. Default: 100.
 * @property {number} [weeklyCooldown=604800000] 
 * Cooldown for Weekly Command (in ms). Default: 7 days (60000 * 60 * 24 * 7 ms)
 * 
 * @property {Number | Number[]} [weeklyAmount=100] Amount of money for Weekly Command. Default: 1000.
 * @property {Number | Number[]} [workAmount=[10, 50]] Amount of money for Work Command. Default: [10, 50].
 * @property {boolean} [subtractOnBuy=true] 
 * If true, when someone buys the item, their balance will subtract by item price. Default: false
 * 
 * @property {number} [sellingItemPercent=75] 
 * Percent of the item's price it will be sold for. Default: 75.
 * 
 * @property {boolean} [deprecationWarnings=true] 
 * If true, the deprecation warnings will be sent in the console. Default: true.
 * 
 * @property {boolean} [savePurchasesHistory=true] If true, the module will save all the purchases history.
 * 
 * @property {number} [updateCountdown=1000] Checks for if storage file exists in specified time (in ms). Default: 1000.
 * @property {string} [dateLocale='en'] The region (example: 'ru'; 'en') to format the date and time. Default: 'en'.
 * @property {UpdaterOptions} [updater=UpdaterOptions] Update checker configuration.
 * @property {ErrorHandlerOptions} [errorHandler=ErrorHandlerOptions] Error handler configuration.
 * @property {CheckerOptions} [optionsChecker=CheckerOptions] Configuration for an 'Economy.utils.checkOptions' method.
 * @property {boolean} [debug=false] Enables or disables the debug mode.
 */

/**
 * User's purchases history class.
 * @type {History}
 */
module.exports = History
