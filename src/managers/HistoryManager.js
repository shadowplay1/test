const DatabaseManager = require('./DatabaseManager')
const EconomyError = require('../classes/util/EconomyError')

const errors = require('../structures/errors')

const HistoryItem = require('../classes/HistoryItem')


class HistoryManager {

    /**
    * History Manager.
    * @param {Object} options Economy configuration.
    * @param {String} options.storagePath Full path to a JSON file. Default: './storage.json'.
    * @param {String} options.dateLocale The region (example: 'ru' or 'en') to format date and time. Default: 'en'.
    * @param {Boolean} options.savePurchasesHistory If true, the module will save all the purchases history.
    */
    constructor(options = {}, database) {


        /**
         * Economy configuration.
         * @type {EconomyOptions}
         * @private
         */
        this.options = options

        /**
         * Full path to a JSON file.
         * @type {String}
         * @private
         */
        this.storagePath = options.storagePath || './storage.json'

        /**
        * Database Manager.
        * @type {DatabaseManager}
        * @private
        */
        this.database = database
    }

    /**
     * Shows the user's purchases history.
     * @param {String} memberID Member ID
     * @param {String} guildID Guild ID
     * @returns {HistoryItem[]} User's purchases history.
     */
    fetch(memberID, guildID) {
        const history = this.database.fetch(`${guildID}.${memberID}.history`)

        if (!this.options.savePurchasesHistory) {
            throw new EconomyError(errors.savingHistoryDisabled)
        }

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        return history.map(
            historyItem =>
                new HistoryItem(guildID, memberID, this.options, historyItem, this.database)
        )
    }

    /**
    * Shows the user's purchases history.
    * 
    * This method is an alias for `HistoryManager.fetch()` method.
    * @param {String} memberID Member ID
    * @param {String} guildID Guild ID
    * @returns {HistoryItem[]} User's purchases history.
    */
    get(memberID, guildID) {
        return this.fetch(memberID, guildID)
    }

    /**
    * Clears the user's purchases history.
    * @param {String} memberID Member ID.
    * @param {String} guildID Guild ID.
    * @returns {Boolean} If cleared: true, else: false.
    */
    clear(memberID, guildID) {
        const history = this.fetch(memberID, guildID)

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        if (!history) return false
        return this.database.remove(`${guildID}.${memberID}.history`)
    }

    /**
     * Adds the item from the shop to the purchases history.
     * @param {String | Number} itemID Item ID or name.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @returns {Boolean} If added: true, else: false.
     */
    add(itemID, memberID, guildID) {
        const shop = this.database.fetch(`${guildID}.shop`)
        const history = this.database.fetch(`${guildID}.${memberID}.history`)

        const item = shop.find(item => item.id == itemID || item.name == itemID)


        if (typeof itemID !== 'number' && typeof itemID !== 'string') {
            throw new EconomyError(errors.invalidTypes.editItemArgs.itemID + typeof itemID)
        }

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        if (!item) return false

        return this.database.push(`${guildID}.${memberID}.history`, {
            id: history.length ? history[history.length - 1].id + 1 : 1,
            memberID,
            guildID,
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
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @returns {Boolean} If removed: true, else: false.
     */
    remove(id, memberID, guildID) {
        if (typeof id !== 'number' && typeof id !== 'string') {
            throw new EconomyError(errors.invalidTypes.id + typeof id)
        }

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        const history = this.fetch(memberID, guildID)

        const historyItem = this.find(
            historyItem =>
                historyItem.id == id &&
                historyItem.memberID == memberID &&
                historyItem.guildID == guildID
        )

        const historyItemIndex = history.findIndex(histItem => histItem.id == historyItem.id)

        if (!historyItem) return false
        history.splice(historyItemIndex, 1)

        return this.database.set(`${guildID}.${memberID}.history`, history)
    }

    /**
     * Searches for the specified item from history.
     * @param {String | Number} id History item ID.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @returns {HistoryItem} Purchases history item.
     */
    find(id, memberID, guildID) {
        const history = this.fetch(memberID, guildID)

        if (typeof id !== 'number' && typeof id !== 'string') {
            throw new EconomyError(errors.invalidTypes.id + typeof id)
        }

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }


        const historyItem = history.find(historyItem => historyItem.id == id)
        return new HistoryItem(guildID, memberID, this.options, historyItem) || null
    }

    /**
     * Searches for the specified item from history.
     * 
     * This method is an alias for the `HistoryManager.find()` method.
     * @param {String | Number} id History item ID.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @returns {HistoryItem} Purchases history item.
     */
    search(id, memberID, guildID) {
        return this.find(id, memberID, guildID)
    }
}

/**
 * Item data object.
 * @typedef {Object} ItemData
 * @property {Number} id Item ID.
 * @property {String} name Item name.
 * @property {Number} price Item price.
 * @property {String} message The message that will be returned on item use.
 * @property {String} description Item description.
 * @property {String} role ID of Discord Role that will be given to Wuser on item use.
 * @property {Number} maxAmount Max amount of the item that user can hold in their inventory.
 * @property {String} date Date when the item was added in the shop.
 * @property {Object} custom Custom item properties object.
 */

/**
 * Inventory data object.
 * @typedef {Object} InventoryData
 * @property {Number} id Item ID in your inventory.
 * @property {String} name Item name.
 * @property {Number} price Item price.
 * @property {String} message The message that will be returned on item use.
 * @property {String} role ID of Discord Role that will be given to user on item use.
 * @property {Number} maxAmount Max amount of the item that user can hold in their inventory.
 * @property {String} date Date when the item was bought by a user.
 * @property {Object} custom Custom item properties object.
 */

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
 * @property {Boolean} [deprecationWarnings=true]
 * If true, the deprecation warnings will be sent in the console. Default: true.
 *
 * @property {Boolean} [savePurchasesHistory=true] If true, the module will save all the purchases history.
 *
 * @property {Number} [sellingItemPercent=75]
 * Percent of the item's price it will be sold for. Default: 75.
 *
 * @property {Number | Number[]} [weeklyAmount=100] Amount of money for Weekly Command. Default: 1000.
 * @property {Number | Number[]} [workAmount=[10, 50]] Amount of money for Work Command. Default: [10, 50].
 * @property {Boolean} [subtractOnBuy=true]
 * If true, when someone buys the item, their balance will subtract by item price. Default: false
 *
 * @property {Number} [updateCountdown=1000] Checks for if storage file exists in specified time (in ms). Default: 1000.
 * @property {String} [dateLocale='en'] The region (example: 'ru' or 'en') to format the date and time. Default: 'en'.
 * @property {UpdaterOptions} [updater=UpdaterOptions] Update checker configuration.
 * @property {ErrorHandlerOptions} [errorHandler=ErrorHandlerOptions] Error handler configuration.
 * @property {CheckerOptions} [optionsChecker=CheckerOptions] Configuration for an 'Economy.utils.checkOptions' method.
 * @property {Boolean} [debug=false] Enables or disables the debug mode.
 */

module.exports = HistoryManager
