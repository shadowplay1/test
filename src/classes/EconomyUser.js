const UtilsManager = require('../managers/UtilsManager')
const ShopManager = require('../managers/ShopManager')

const Balance = require('./user/Balance')
const Bank = require('./user/Bank')

const History = require('./user/History')
const Inventory = require('./user/Inventory')

const Cooldowns = require('./user/Cooldowns')
const Rewards = require('./user/Rewards')

const Items = require('./user/Items')


/**
* Economy user class.
*/
class EconomyUser {

    /**
     * Economy user class.
     * @param {String} id User ID.
     * @param {String} guildID Guild ID.
     * @param {EconomyOptions} ecoOptions Economy configuration.
     * @param {RawEconomyUser} userObject Economy user object.
     * @param {DatabaseManager} database Database Manager.
     */
    constructor(id, guildID, ecoOptions, userObject, database) {

        /**
         * User's ID.
         * @type {String}
         */
        this.id = id

        /**
         * Guild ID.
         * @type {String}
         */
        this.guildID = guildID

        /**
         * User's balance.
         * @type {Number}
         */
        this.money = userObject.money


        /**
         * Economy configuration.
         * @type {EconomyOptions}
         * @private
         */
        this.options = ecoOptions

        /**
         * Utils Manager.
         * @type {UtilsManager}
         * @private
         */
        this._utils = new UtilsManager(ecoOptions)

        /**
         * Shop Manager.
         * @type {ShopManager}
         * @private
         */
        this._shop = new ShopManager(this.options)

        /**
         * User cooldowns.
         * @type {Cooldowns}
         */
        this.cooldowns = new Cooldowns(userObject, ecoOptions)

        /**
         * User history.
         * @type {History}
         */
        this.history = new History(id, guildID, ecoOptions)

        /**
         * User inventory.
         * @type {Inventory}
         */
        this.inventory = new Inventory(id, guildID, ecoOptions)

        /**
         * User balance.
         * @type {Balance}
         */
        this.balance = new Balance(id, guildID, ecoOptions)

        /**
         * User bank balance.
         * @type {Bank}
         */
        this.bank = new Bank(id, guildID, ecoOptions)

        /**
         * User rewards.
         * @type {Rewards}
         */
        this.rewards = new Rewards(id, guildID, ecoOptions)

        /**
         * User items.
         * @type {Items}
         */
        this.items = new Items(id, guildID, ecoOptions, database)


        for (const [key, value] of Object.entries(userObject || {})) {
            this[key] = value
        }
    }

    /**
     * Deletes the user from database.
     * @returns {EconomyUser} Deleted user object.
     */
    delete() {
        this._utils.removeUser(this.id, this.guildID)
        return this
    }

    /**
     * Sets the default user object for a specified member.
     * @returns {Boolean} If reset successfully: true; else: false.
     */
    reset() {
        return this._utils.reset(id, this.guildID)
    }
}

/**
 * @typedef {Object} RawEconomyUser Raw economy user object from database.
 * @property {number} dailyCooldown User's daily cooldown.
 * @property {number} workCooldown User's work cooldown.
 * @property {number} weeklyCooldown User's weekly cooldown.
 * @property {number} money User's balance.
 * @property {number} bank User's bank balance.
 * @property {InventoryData} inventory User's inventory.
 * @property {HistoryData} history User's purchases history.
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
 * Economy user class.
 * @type {EconomyUser}
 */
module.exports = EconomyUser
