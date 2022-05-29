const ShopManager = require('../../managers/ShopManager')
const InventoryManager = require('../../managers/InventoryManager')
const DatabaseManager = require('../../managers/DatabaseManager')

/**
 * User Items.
 */
class Items {

    /**
     * User Items.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @param {EconomyOptions} ecoOptions Economy configuratuion.
     * @param {DatabaseManager} database Database Manager.
     */
    constructor(memberID, guildID, ecoOptions, database) {

        /**
         * Member ID.
         * @type {String}
         * @private
         */
        this.memberID = memberID

        /**
         * Guild ID.
         * @type {String}
         * @private
         */
        this.guildID = guildID

        /**
         * Shop Manager.
         * @type {ShopManager}
         * @private
         */
        this._shop = new ShopManager(ecoOptions)

        /**
         * Inventory Manager.
         * @type {InventoryManager}
         * @private
         */
        this._inventory = new InventoryManager(ecoOptions, database)
    }

    /**
     * Buys the item from the shop.
     * @param {String | Number} itemID Item ID or name.
     * 
     * @returns {Boolean} 
     * If item bought successfully: true; if item not found, false will be returned; 
     * if user reached the item's max amount: 'max' string.
     */
    buy(itemID) {
        return this._shop.buyItem(itemID, this.memberID, this.guildID)
    }

    /**
     * Adds the item from the shop to user's inventory.
     * @param {String | Number} itemID Item ID or name.
     * @returns {Boolean} If added successfully: true, else: false.
     */
    add(itemID) {
        return this._inventory.addItem(itemID, this.memberID, this.guildID)
    }

    /**
     * Gets the specified item from the user's inventory.
     * @param {String | Number} itemID Item ID or name.
     * @returns {InventoryData[]} User's inventory array.
     */
    get(itemID) {
        return this._inventory.findItem(itemID, this.memberID, this.guildID)
    }

    /**
     * Uses the item from user's inventory.
     * @param {Number | String} itemID Item ID or name.
     * @param {Client} [client] Discord Client [Specify if the role will be given in a discord server].
     * @returns {String} Item message.
     */
    use(itemID, client) {
        return this._inventory.useItem(itemID, this.memberID, this.guildID, client)
    }

    /**
     * Removes the item from user's inventory.
     * @param {String | Number} itemID Item ID or name.
     * @returns {Boolean} If removed successfully: true, else: false.
     */
    remove(itemID) {
        return this._inventory.removeItem(itemID, this.memberID, this.guildID)
    }

    /**
     * Removes the item from user's inventory.
     *
     * This method is an alias for 'Items.remove' method
     * @param {String | Number} itemID Item ID or name.
     * @returns {Boolean} If removed successfully: true, else: false.
     */
    delete(itemID) {
        return this.remove(itemID)
    }
}


/**
 * @typedef {Object} EconomyOptions Default Economy configuration.
 * @property {String} [storagePath='./storage.json'] Full path to a JSON file. Default: './storage.json'
 * @property {Boolean} [checkStorage=true] Checks the if database file exists and if it has errors. Default: true
 * 
 * @property {Number} [dailyCooldown=86400000] 
 * Cooldown for Daily Command (in ms). Default: 24 hours (60000 * 60 * 24 ms)
 * 
 * @property {Number} [workCooldown=3600000] Cooldown for Work Command (in ms). Default: 1 hour (60000 * 60 ms)
 * @property {Number | Number[]} [dailyAmount=100] Amount of money for Daily Command. Default: 100.
 * 
 * @property {Number} [weeklyCooldown=604800000] 
 * Cooldown for Weekly Command (in ms). Default: 7 days (60000 * 60 * 24 * 7 ms)
 * 
 * @property {Number} [sellingItemPercent=75]
 * Percent of the item's price it will be sold for. Default: 75.
 *
 * @property {Boolean} [deprecationWarnings=true]
 * If true, the deprecation warnings will be sent in the console. Default: true.
 *
 * @property {Boolean} [savePurchasesHistory=true] If true, the module will save all the purchases history.
 *
 * @property {Number | Number[]} [weeklyAmount=100] Amount of money for Weekly Command. Default: 1000.
 * @property {Number | Number[]} [workAmount=[10, 50]] Amount of money for Work Command. Default: [10, 50].
 * 
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
 * User Items.
 * @type {Items}
 */
module.exports = Items
