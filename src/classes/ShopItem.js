const errors = require('../structures/errors')
const EconomyError = require('./util/EconomyError')

/**
* Shop item class.
*/
class ShopItem {

    /**
     * Shop item class.
     * @param {String} guildID Guild ID.
     * @param {EconomyOptions} ecoOptions Economy options object.
     * @param {ItemData} itemObject Shop item object.
     */
    constructor(guildID, ecoOptions, itemObject) {

        /**
         * Guild ID.
         * @type {String}
         */
        this.guildID = guildID

        /**
         * Shop item ID.
         * @type {Number}
         */
        this.id = itemObject.id

        /**
         * Item name.
         * @type {String}
         */
        this.itemName = itemObject.itemName

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
         * Item description.
         * @type {String}
         */
        this.description = itemObject.description

        /**
         * ID of Discord Role that will be given to Wuser on item use.
         * @type {String}
         */
        this.role = itemObject.role

        /**
         * Max amount of the item that user can hold in his inventory.
         * @type {Number}
         */
        this.maxAmount = itemObject.maxAmount

        /**
         * Date when the item was added in the shop.
         * @type {String}
         */
        this.date = itemObject.date

        for (const [key, value] of Object.entries(itemObject || {})) {
            this[key] = value
        }
    }


    /**
     * Edits the item in the shop.
     * 
     * @param {"description" | "price" | "itemName" | "message" | "maxAmount" | "role"} itemProperty
     * This argument means what thing in item you want to edit (item property). 
     * Available item properties are 'description', 'price', 'name', 'message', 'amount', 'role'.
     * 
     * @param {any} value Any value to set.
     * @returns {Boolean} If edited successfully: true, else: false.
     */
    edit(itemProperty, value) {
        const itemProperties = ['description', 'price', 'itemName', 'message', 'maxAmount', 'role']

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

            const itemIndex = shop.findIndex(item => item.id == this.id || item.itemName == this.id)
            const item = shop[itemIndex]

            if (!item) return false

            item[itemProperty] = value

            this.database.changeElement(`${this.guildID}.shop`, itemIndex, item)

            this.emit('shopEditItem', {
                itemID: this.id,
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
     * This method is an alias for 'ShopItem.edit()' method.
     * 
     * @param {"description" | "price" | "itemName" | "message" | "maxAmount" | "role"} itemProperty
     * This argument means what thing in item you want to edit (item property). 
     * Available item properties are 'description', 'price', 'name', 'message', 'amount', 'role'.
     * 
     * @param {any} value Any value to set.
     * @returns {Boolean} If edited successfully: true, else: false.
     */
    editItem(itemProperty, value) {
        return this.edit(itemProperty, value)
    }

    /**
     * Removes an item from the shop.
     * 
     * This method is an alias for 'ShopItem.remove()' method.
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
        const shop = this.database.fetch(`${this.guildID}.shop`) || []
        const itemIndex = shop.findIndex(item => item.id == this.id || item.itemName == this.id)
        const item = shop[itemIndex]

        this.database.removeElement(`${guildID}.shop`, itemIndex)

        this.emit('shopRemoveItem', {
            id: item.id,
            itemName: item.itemName,
            price: item.price,
            message: item.message,
            description: item.description,
            maxAmount: item.maxAmount,
            role: item.role || null,
            date: item.date
        })

        return true
    }
}


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
 * Shop item class.
 * @type {ShopItem}
 */
module.exports = ShopItem