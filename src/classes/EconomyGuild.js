const UtilsManager = require('../managers/UtilsManager')
const DatabaseManager = require('../managers/DatabaseManager')

const HistoryManager = require('../managers/HistoryManager')
const ShopManager = require('../managers/ShopManager')
const InventoryManager = require('../managers/InventoryManager')

const BalanceManager = require('../managers/BalanceManager')
const BankManager = require('../managers/BankManager')
const UserManager = require('../managers/UserManager')
const BaseManager = require('../managers/BaseManager')

/**
* Economy guild class.
*/
class EconomyGuild {

    /**
     * Economy guild class.
     * @param {String} id Guild ID.
     * @param {EconomyOptions} ecoOptions Economy options object.
     * @param {any} guildObject Economy guild object.
     */
    constructor(id, ecoOptions, guildObject) {

        /**
         * Guild User Manager.
         * @type {UserManager}
         */
        this.users = new UserManager(ecoOptions)

        /**
         * Guild ID.
         * @type {String}
         */
        this.id = id

        /**
         * Full path to a JSON file. Default: './storage.json'
         * @type {String}
         * @private
         */
        this.storagePath = ecoOptions.storagePath

        /**
         * Database Manager.
         * @type {DatabaseManager}
         * @private
         */
        this.database = new DatabaseManager({ storagePath: ecoOptions.storagePath })

        /**
         * Utils Manager.
         * @type {UtilsManager}
         * @private
         */
        this.utils = new UtilsManager({ storagePath: ecoOptions.storagePath })

        /**
         * Shop Manager.
         * @type {ShopManager}
         * @private
         */
        this._shop = new ShopManager(ecoOptions)

        /**
         * Shop class.
         * @type {Shop}
         */
        this.shop = new Shop(id)


        for (const [key, value] of Object.entries(guildObject || {})) {
            this[key] = value
        }
    }

    /**
     * Deletes the guild from database.
     * @returns {EconomyGuild} Deleted guild object.
     */
    delete() {
        this.database.delete(this.id)
        return this
    }

    /**
     * Sets the default guild object for a specified member.
     * @returns {Boolean} If reset successfully: true; else: false.
     */
    reset() {
        return this.database.set(this.id, {
            shop: [],
            settings: []
        })
    }
}

class Shop extends BaseManager {
    constructor(guildID, storagePath) {

        /**
         * Guild ID.
         * @type {String}
         * @private
         */
        this.guildID = guildID

        /**
         * Full path to a JSON file. Default: './storage.json'.
         * @type {String}
         * @private
         */
        this.storagePath = storagePath

        /**
         * Shop Manager.
         * @type {ShopManager}
         * @private
         */
        this.shop = new ShopManager({ storagePath: this.storagePath })
    }

    /**
    * Gets the item from the shop.
    * @param {string | number} itemID Item ID.
    * @returns {ItemData} Shop item.
    */
    get(itemID) {
        return this.shop
            .fetch(this.guildID)
            .find(x => x.id == itemID)
    }

    /**
     * Gets all the items in the shop.
     * @returns {ItemData[]} Guild array.
     */
    all() {
        return this.shop.fetch(this.guildID)
    }

    /**
     * Creates an item in shop.
     * @param {AddItemOptions} options Options object with item info.
     * @returns {ItemData} Item info.
     */
    addItem(options = {}) {
        return this.shop.addItem(this.guildID, options)
    }

    /**
     * Creates an item in shop.
     * 
     * This method is an alias for the `EconomyGuild.shop.addItem()` method.
     * @param {AddItemOptions} options Options object with item info.
     * @returns {ItemData} Item info.
     */
    add(options = {}) {
        return this.addItem(options)
    }

    /**
     * Edits the item in the shop.
     * @param {Number | String} itemID Item ID or name.
     * @param {'description' | 'price' | 'itemName' | 'message' | 'maxAmount' | 'role'} itemProperty 
     * This argument means what thing in item you want to edit (item property). 
     * Available item properties are 'description', 'price', 'name', 'message', 'amount', 'role'.
     * 
     * @returns {Boolean} If edited successfully: true, else: false.
     */
    editItem(itemID, itemProperty, value) {
        return this.shop.editItem(itemID, this.guildID, itemProperty, value)
    }

    /**
     * Edits the item in the shop.
     * 
     * This method is an alias for the `EconomyGuild.shop.editItem()` method.
     * @param {Number | String} itemID Item ID or name.
     * @param {'description' | 'price' | 'itemName' | 'message' | 'maxAmount' | 'role'} itemProperty 
     * This argument means what thing in item you want to edit (item property). 
     * Available item properties are 'description', 'price', 'name', 'message', 'amount', 'role'.
     * 
     * @returns {Boolean} If edited successfully: true, else: false.
     */
    edit(itemID, itemProperty, value) {
        return this.editItem(itemID, itemProperty, value)
    }

    /**
     * Clears the shop.
     * @returns {Boolean} If cleared: true, else: false.
     */
    clear() {
        return this.shop.clear(this.guildID)
    }

    /**
     * Shows all items in the shop.
     * @returns {ItemData[]} The shop array.
     */
    list() {
        return this.shop.list(this.guildID)
    }

    /**
     * Shows all items in the shop.
     * 
     * This method is an alias for the `EconomyGuild.shop.list()` method.
     * @returns {ItemData[]} The shop array.
     */
    fetch() {
        return this.list()
    }

    /**
     * Searches for the item in the shop.
     * @param {Number | String} itemID Item ID or name.
     * @returns {ItemData} If item not found: null; else: item info object.
     */
    searchItem(itemID) {
        return this.shop.searchItem(itemID, this.guildID)
    }

    /**
     * Searches for the item in the shop.
     * 
     * This method is an alias for the `EconomyGuild.shop.searchItem()` method.
     * @param {Number | String} itemID Item ID or name.
     * @returns {ItemData} If item not found: null; else: item info object.
     */
    findItem(itemID) {
        return this.searchItem(itemID)
    }
}

/**
 * @typedef {Object} AddItemOptions Options object with item info for 'Economy.shop.addItem' method.
 * @property {String} itemName Item name.
 * @property {String | Number} price Item price.
 * @property {String} [message='You have used this item!'] Item message that will be returned on use.
 * @property {String} [description='Very mysterious item.'] Item description.
 * @property {String | Number} [maxAmount=null] Max amount of the item that user can hold in his inventory.
 * @property {String} [role=null] Role ID from your Discord server.
 * @returns {ItemData} Item info.
 */

/**
 * Item data object.
 * @typedef {Object} ItemData
 * @property {Number} id Item ID.
 * @property {String} itemName Item name.
 * @property {Number} price Item price.
 * @property {String} message The message that will be returned on item use.
 * @property {String} description Item description.
 * @property {String} role ID of Discord Role that will be given to Wuser on item use.
 * @property {Number} maxAmount Max amount of the item that user can hold in his inventory.
 * @property {String} date Date when the item was added in the shop.
 */

/**
 * @typedef {Object} EconomyOptions Default Economy options object.
 * @property {String} [storagePath='./storage.json'] Full path to a JSON file. Default: './storage.json'
 * @property {Boolean} [checkStorage=true] Checks the if database file exists and if it has errors. Default: true
 * @property {Number} [dailyCooldown=86400000] 
 * Cooldown for Daily Command (in ms). Default: 24 Hours (60000 * 60 * 24) ms
 * 
 * @property {Number} [workCooldown=3600000] Cooldown for Work Command (in ms). Default: 1 Hour (60000 * 60) ms
 * @property {Number | Number[]} [dailyAmount=100] Amount of money for Daily Command. Default: 100.
 * @property {Number} [weeklyCooldown=604800000] 
 * Cooldown for Weekly Command (in ms). Default: 7 Days (60000 * 60 * 24 * 7) ms
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
 * @property {UpdaterOptions} [updater=UpdaterOptions] Update Checker options object.
 * @property {ErrorHandlerOptions} [errorHandler=ErrorHandlerOptions] Error Handler options object.
 * @property {CheckerOptions} [optionsChecker=CheckerOptions] Options object for an 'Economy.utils.checkOptions' method.
 */

/**
 * Economy guild class.
 * @type {EconomyGuild}
 */
module.exports = EconomyGuild