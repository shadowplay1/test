const EconomyError = require('../util/EconomyError')
const errors = require('../../structures/errors')

const BaseManager = require('../../managers/BaseManager')

const ShopItem = require('../ShopItem')

/**
 * Guild shop class.
 * @extends BaseManager
 */
class Shop extends BaseManager {

    /**
     * Guild shop constructor.
     * @param {String} guildID Guild ID.
     * @param {EconomyOptions} options Economy configuration.
     */
    constructor(guildID, options) {
        super(options, null, guildID,  ShopItem)

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
        const item = shop.find(item => item.id == itemID || item.name == itemID)

        if (typeof itemID !== 'number' && typeof itemID !== 'string') {
            throw new EconomyError(errors.invalidTypes.editItemArgs.itemID + typeof itemID)
        }

        if (!item) return null
        return new ShopItem(this.guildID, this.database, item)
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
     * @param {AddItemOptions} options Configuration with item info.
     * @returns {ItemData} Item info.
     */
    addItem(options = {}) {
        let name = options.name

        const {
            itemName, price, message, custom,
            description, maxAmount, role
        } = options

        const dateLocale = this.database.fetch(`${this.guildID}.settings.dateLocale`)
            || this.options.dateLocale

        const date = new Date().toLocaleString(dateLocale)
        const shop = this.database.fetch(`${this.guildID}.shop`)

        if (!name && itemName) {
            name = itemName

            console.log(
                errors.propertyDeprecationWarning('Shop', 'itemName', 'name', {
                    method: 'addItem',
                    argumentName: 'options',
                    argumentsList: ['options'],
                    example: 'banana'
                })
            )
        }

        if (typeof this.guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof this.guildID)
        }

        if (typeof name !== 'string') {
            throw new EconomyError(errors.invalidTypes.addItemOptions.name + typeof name)
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

        if (custom && typeof custom !== 'object' && !Array.isArray(custom)) {
            throw new EconomyError(errors.invalidTypes.addItemOptions.role + typeof role)
        }

        const itemInfo = {
            id: shop?.length ? shop[shop.length - 1].id + 1 : 1,
            name,
            price,
            message: message || 'You have used this item!',
            description: description || 'Very mysterious item.',
            maxAmount: maxAmount == undefined ? null : Number(maxAmount),
            role: role || null,
            date,
            custom: custom || {}
        }

        this.database.push(`${this.guildID}.shop`, itemInfo)
        return new ShopItem(this.guildID, this.database, itemInfo)
    }

    /**
     * Creates an item in shop.
     * 
     * This method is an alias for the `EconomyGuild.shop.addItem()` method.
     * @param {AddItemOptions} options Configuration with item info.
     * @returns {ItemData} Item info.
     */
    add(options = {}) {
        return this.addItem(options)
    }

    /**
     * Edits the item in the shop.
     * @param {Number | String} itemID Item ID or name.
     * @param {'description' | 'price' | 'name' | 'message' | 'maxAmount' | 'role'} itemProperty 
     * This argument means what thing in item you want to edit (item property). 
     * Available item properties are 'description', 'price', 'name', 'message', 'amount', 'role', 'custom'.
     * 
     * @param {any} value Any value to set.
     * @returns {Boolean} If edited successfully: true, else: false.
     */
    editItem(itemID, itemProperty, value) {
        const itemProperties = ['description', 'price', 'name', 'message', 'maxAmount', 'role', 'custom']

        if (typeof itemID !== 'number' && typeof itemID !== 'string') {
            throw new EconomyError(errors.invalidTypes.editItemArgs.itemID + typeof itemID)
        }

        if (typeof this.guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guilddID + typeof this.guildID)
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
            const shop = this.list(this.guildID)

            const itemIndex = shop.findIndex(item => item.id == itemID || item.name == itemID)
            const item = shop[itemIndex]

            if (!item) return false

            item[itemProperty] = value
            this.database.changeElement(`${this.guildID}.shop`, itemIndex, item)

            this.emit('shopItemEdit', {
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
     * @param {'description' | 'price' | 'name' | 'message' | 'maxAmount' | 'role'} itemProperty 
     * This argument means what thing in item you want to edit (item property). 
     * Available item properties are 'description', 'price', 'name', 'message', 'amount', 'role', 'custom'.
     * 
     * @returns {Boolean} If edited successfully: true, else: false.
     */
    edit(itemID, itemProperty, value) {
        return this.editItem(itemID, itemProperty, value)
    }

    /**
     * Sets a custom object for the item.
     * @param {string | number} itemID Item ID or name.
     * @param {Object} custom Custom item data object.
     * @returns {Boolean} If set successfully: true, else: false.
     */
    setCustom(itemID, customObject) {
        return this.editItem(itemID, this.guildID, 'custom', customObject)
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
        return shop.map(item => new ShopItem(this.guildID, this.database, item))
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
 * Guild shop class.
 * @type {Shop}
 */
module.exports = Shop


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
 * @typedef {Object} AddItemOptions Configuration with item info for 'Economy.shop.addItem' method.
 * @property {String} name Item name.
 * @property {String | Number} price Item price.
 * @property {String} [message='You have used this item!'] Item message that will be returned on use.
 * @property {String} [description='Very mysterious item.'] Item description.
 * @property {String | Number} [maxAmount=null] Max amount of the item that user can hold in their inventory.
 * @property {String} [role=null] Role ID from your Discord server.
 * @property {Object} [custom] Custom item properties object.
 * @returns {ItemData} Item info.
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
