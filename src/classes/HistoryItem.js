/**
* History item class.
*/
class HistoryItem {

    /**
     * History item class.
     * @param {String} guildID Guild ID.
     * @param {EconomyOptions} ecoOptions Economy configuration.
     * @param {HistoryData} itemObject User purchases history item object.
     */
    constructor(guildID, ecoOptions, itemObject) {

        /**
         * Guild ID.
         * @type {String}
         */
        this.guildID = guildID

        /**
         * Item ID in history.
         * @type {Number}
         */
        this.id = itemObject.id

        /**
         * Item name.
         * @type {String}
         */
        this.name = itemObject.name

        /**
         * Item price.
         * @type {Number}
         */
        this.price = itemObject.price

        /**
         * The message that will be returned on item use.
         * @type {String}
         */
        this.message = itemObject.message

        /**
        * Date when the item was bought by a user.
        * @type {String}
        */
        this.date = itemObject.date

        /**
         * ID of Discord Role that will be given to Wuser on item use.
         * @type {String}
         */
        this.role = itemObject.role

        for (const [key, value] of Object.entries(itemObject || {})) {
            this[key] = value
        }
    }

    /**
     * Removes an item from the shop.
     * 
     * This method is an alias for 'HistoryItem.remove()' method.
     * @returns {Boolean} If removed: true, else: false.
     */
    delete() {
        return this.remove()
    }

    /**
     * Removes an item from the shop.
     * @returns {Boolean} If removed: true, else: false.
     */
    remove() {
        // return this._inventory.removeItem(this.id, this.guildID)
    }
}



/**
 * History data object.
 * @typedef {Object} HistoryData
 * @property {Number} id Item ID in history.
 * @property {String} name Item name.
 * @property {Number} price Item price.
 * @property {String} message The message that will be returned on item use.
 * @property {String} role ID of Discord Role that will be given to user on item use.
 * @property {String} date Date when the item was bought by a user.
 * @property {String} memberID Member ID.
 * @property {String} guildID Guild ID.
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
 * History item class.
 * @type {HistoryItem}
 */
module.exports = HistoryItem