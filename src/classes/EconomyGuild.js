const UtilsManager = require('../managers/UtilsManager')
const DatabaseManager = require('../managers/DatabaseManager')

const UserManager = require('../managers/UserManager')
const BaseManager = require('../managers/BaseManager')

const EconomyError = require('./util/EconomyError')
const errors = require('../structures/errors')
const ShopItem = require('./ShopItem')

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
         * Shop class.
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

class Shop extends BaseManager {
    constructor(guildID, options) {
        super(options)

        /**
         * Guild ID.
         * @type {String}
         * @private
         */
        this.guildID = guildID
    }

    /**
    * Gets the item from the shop.
    * @param {string | number} itemID Item ID.
    * @returns {ItemData} Shop item.
    */
    get(itemID) {
        const shop = this.all()
        const item = shop.find(item => item.id == itemID || item.itemName == itemID)

        if (typeof itemID !== 'number' && typeof itemID !== 'string') {
            throw new EconomyError(errors.invalidTypes.editItemArgs.itemID + typeof itemID)
        }

        if (!item) return null
        return new ShopItem(this.guildID, this.options, item)
    }

    /**
     * Gets all the items in the shop.
     * 
     * This method is an alias for the`EconomyGuild.shop.fetch()` method.
     * @returns {ItemData[]} Guild array.
     */
    all() {
        return this.fetch()
    }

    /**
     * Creates an item in shop.
     * @param {AddItemOptions} options Options object with item info.
     * @returns {ItemData} Item info.
     */
    addItem(options = {}) {
        const {
            itemName, price, message,
            description, maxAmount, role
        } = options

        const date = new Date().toLocaleString(this.options.dateLocale || 'en')
        const shop = this.database.fetch(`${this.guildID}.shop`)

        if (typeof itemName !== 'string') {
            throw new EconomyError(errors.invalidTypes.addItemOptions.itemName + typeof itemName)
        }

        if (isNaN(price)) {
            throw new EconomyError(errors.invalidTypes.addItemOptions.price + typeof price)
        }

        if (message && typeof message !== 'string') {
            throw new EconomyError(errors.invalidTypes.addItemOptions.message + typeof message)
        }

        if (description && typeof description !== 'string') {
            throw new EconomyError(errors.invalidTypes.addItemOptions.description + typeof description)
        }

        if (maxAmount !== undefined && isNaN(maxAmount)) {
            throw new EconomyError(errors.invalidTypes.addItemOptions.maxAmount + typeof maxAmount)
        }

        if (role && typeof role !== 'string') {
            throw new EconomyError(errors.invalidTypes.addItemOptions.role + typeof role)
        }

        const itemInfo = {
            id: shop.length ? shop[shop.length - 1].id + 1 : 1,
            itemName,
            price,
            message: message || 'You have used this item!',
            description: description || 'Very mysterious item.',
            maxAmount: maxAmount == undefined ? null : Number(maxAmount),
            role: role || null,
            date
        }

        this.database.push(`${this.guildID}.shop`, itemInfo)
        return new ShopItem(this.guildID, this.options, itemInfo)
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
     * @param {any} value Any value to set.
     * @returns {Boolean} If edited successfully: true, else: false.
     */
    editItem(itemID, itemProperty, value) {
        const itemProperties = ['description', 'price', 'itemName', 'message', 'maxAmount', 'role']

        if (typeof itemID !== 'number' && typeof itemID !== 'string') {
            throw new EconomyError(errors.invalidTypes.editItemArgs.itemID + typeof itemID)
        }

        if (!itemProperties.includes(itemProperty)) {
            throw new EconomyError(errors.invalidTypes.editItemArgs.itemProperty + itemProperty)
        }

        if (value == undefined) {
            throw new EconomyError(errors.invalidTypes.editItemArgs.itemProperty + value)
        }

        const edit = (itemProperty, value) => {

            /**
             * @type {ItemData[]}
             */
            const shop = this.all()

            const itemIndex = shop.findIndex(item => item.id == itemID || item.itemName == itemID)
            const item = shop[itemIndex]

            if (!item) return false

            item[itemProperty] = value

            this.database.changeElement(`${this.guildID}.shop`, itemIndex, item)

            this.emit('shopEditItem', {
                itemID,
                guildID: this.guildID,
                changed: itemProperty,
                oldValue: item[itemProperty],
                newValue: value
            })

            return true
        }

        switch (itemProperty) {
            case itemProperties[0]:
                return edit(itemProperties[0], value)

            case itemProperties[1]:
                return edit(itemProperties[1], value)

            case itemProperties[2]:
                return edit(itemProperties[2], value)

            case itemProperties[3]:
                return edit(itemProperties[3], value)

            case itemProperties[4]:
                return edit(itemProperties[4], value)

            case itemProperties[5]:
                return edit(itemProperties[5], value)

            default:
                return null
        }
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
        const shop = this.all(this.guildID)

        if (!shop && !shop?.length) {
            this.emit('shopClear', false)
            return false
        }

        this.database.remove(`${this.guildID}.shop`)
        this.emit('shopClear', true)

        return true
    }

    /**
     * Shows all items in the shop.
     * @returns {ItemData[]} The shop array.
     */
    fetch() {
        const shop = this.database.fetch(`${this.guildID}.shop`) || []
        return shop.map(item => new ShopItem(this.guildID, this.options, item))
    }

    /**
     * Searches for the item in the shop.
     * 
     * This method is an alias for the `EconomyGuild.shop.get()` method.
     * @param {Number | String} itemID Item ID or name.
     * @returns {ItemData} If item not found: null; else: item info object.
     */
    findItem(itemID) {
        return this.get(itemID)
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