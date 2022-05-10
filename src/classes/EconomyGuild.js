const UtilsManager = require('../managers/UtilsManager')
const DatabaseManager = require('../managers/DatabaseManager')
const UserManager = require('../managers/UserManager')

const Shop = require('./guild/Shop')


/**
* Economy guild class.
*/
class EconomyGuild {

    /**
     * Economy guild class.
     * @param {String} id Guild ID.
     * @param {EconomyOptions} ecoOptions Economy configuration.
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
         * Guild shop info.
         * @type {Shop}
         */
        this.shop = new Shop(id, ecoOptions)


        delete guildObject.shop

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

/**
 * @typedef {Object} AddItemOptions Configuration with item info for 'Economy.shop.addItem' method.
 * @property {String} name Item name.
 * @property {String | Number} price Item price.
 * @property {String} [message='You have used this item!'] Item message that will be returned on use.
 * @property {String} [description='Very mysterious item.'] Item description.
 * @property {String | Number} [maxAmount=null] Max amount of the item that user can hold in their inventory.
 * @property {String} [role=null] Role ID from your Discord server.
 * @returns {ItemData} Item info.
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
 * Economy guild class.
 * @type {EconomyGuild}
 */
module.exports = EconomyGuild