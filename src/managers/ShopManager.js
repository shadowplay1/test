const Emitter = require('../classes/util/Emitter')
const EconomyError = require('../classes/util/EconomyError')

const DatabaseManager = require('./DatabaseManager')
const SettingsManager = require('./SettingsManager')

const errors = require('../structures/errors')
const ShopItem = require('../classes/ShopItem')

/**
 * Shop manager methods class.
 * @extends {Emitter}
 */
class ShopManager extends Emitter {

    /**
      * Shop Manager.
      * @param {Object} options Economy configuration.
      * @param {String} options.storagePath Full path to a JSON file. Default: './storage.json'.
      * @param {String} options.dateLocale The region (example: 'ru' or 'en') to format date and time. Default: 'en'.
      * @param {Boolean} options.subtractOnBuy
      * If true, when someone buys the item, their balance will subtract by item price.
      * 
      * @param {Boolean} options.deprecationWarnings 
      * If true, the deprecation warnings will be sent in the console.
      * 
      * @param {Boolean} options.savePurchasesHistory If true, the module will save all the purchases history.
     */
    constructor(options = {}) {
        super()

        /**
         * Economy configuration.
         * @type {?EconomyOptions}
         * @private
         */
        this.options = options

        /**
         * Database manager methods object.
         * @type {DatabaseManager}
         * @private
         */
        this.database = new DatabaseManager(options)

        /**
         * Database manager methods object.
         * @type {SettingsManager}
         * @private
         */
        this.settings = new SettingsManager(options)
    }

    /**
     * Creates an item in shop.
     * @param {String} guildID Guild ID.
     * @param {AddItemOptions} options Configuration with item info.
     * @returns {ShopItem} Item info.
     */
    addItem(guildID, options = {}) {
        const {
            name, price, message,
            description, maxAmount, role
        } = options


        const dateLocale = this.settings.get('dateLocale', guildID)
            || this.options.dateLocale

        const date = new Date().toLocaleString(dateLocale)
        const shop = this.database.fetch(`${guildID}.shop`)

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
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

        const itemInfo = {
            id: shop?.length ? shop[shop.length - 1].id + 1 : 1,
            name,
            price,
            message: message || 'You have used this item!',
            description: description || 'Very mysterious item.',
            maxAmount: maxAmount == undefined ? null : Number(maxAmount),
            role: role || null,
            date
        }

        this.database.push(`${guildID}.shop`, itemInfo)
        return new ShopItem(guildID, this.options, itemInfo)
    }

    /**
     * Creates an item in shop.
     * 
     * This method is an alias for the `ShopManager.addItem()` method.
     * @param {String} guildID Guild ID.
     * @param {AddItemOptions} options Configuration with item info.
     * @returns {ShopItem} Item info.
     */
    add(guildID, options = {}) {
        return this.addItem(guildID, options)
    }

    /**
     * Edits the item in the shop.
     * @param {Number | String} itemID Item ID or name.
     * @param {String} guildID Guild ID
     * @param {'description' | 'price' | 'name' | 'message' | 'maxAmount' | 'role'} itemProperty 
     * This argument means what thing in item you want to edit (item property). 
     * Available item properties are 'description', 'price', 'name', 'message', 'amount', 'role'.
     * 
     * @returns {Boolean} If edited successfully: true, else: false.
     */
    editItem(itemID, guildID, itemProperty, value) {
        const itemProperties = ['description', 'price', 'name', 'message', 'maxAmount', 'role']

        if (typeof itemID !== 'number' && typeof itemID !== 'string') {
            throw new EconomyError(errors.invalidTypes.editItemArgs.itemID + typeof itemID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
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
            const shop = this.list(guildID)

            const itemIndex = shop.findIndex(item => item.id == itemID || item.name == itemID)
            const item = shop[itemIndex]

            if (!item) return false

            item[itemProperty] = value

            this.database.changeElement(`${guildID}.shop`, itemIndex, item)

            this.emit('shopItemEdit', {
                itemID,
                guildID,
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
     * This method is an alias for the `ShopManager.editItem()` method.
     * @param {Number | String} itemID Item ID or name.
     * @param {String} guildID Guild ID
     * @param {'description' | 'price' | 'name' | 'message' | 'maxAmount' | 'role'} itemProperty 
     * This argument means what thing in item you want to edit (item property). 
     * Available item properties are 'description', 'price', 'name', 'message', 'amount', 'role'.
     * @param {any} value Any value to set.
     * 
     * @returns {Boolean} If edited successfully: true, else: false.
     */
    edit(itemID, guildID, itemProperty, value) {
        return this.editItem(itemID, guildID, itemProperty, value)
    }

    /**
     * Removes an item from the shop.
     * @param {Number | String} itemID Item ID or name .
     * @param {String} guildID Guild ID.
     * @returns {Boolean} If removed: true, else: false.
     */
    removeItem(itemID, guildID) {

        /**
        * @type {ItemData[]}
        */
        const shop = this.list(guildID)
        const itemIndex = shop.findIndex(item => item.id == itemID || item.name == itemID)
        const item = shop[itemIndex]

        if (typeof itemID !== 'number' && typeof itemID !== 'string') {
            throw new EconomyError(errors.invalidTypes.editItemArgs.itemID + typeof itemID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        this.database.removeElement(`${guildID}.shop`, itemIndex)

        this.emit('shopRemoveItem', {
            id: item.id,
            name: item.name,
            price: item.price,
            message: item.message,
            description: item.description,
            maxAmount: item.maxAmount,
            role: item.role || null,
            date: item.date
        })

        return true
    }

    /**
     * Clears the shop.
     * @param {String} guildID Guild ID.
     * @returns {Boolean} If cleared: true, else: false.
     */
    clear(guildID) {
        const shop = this.list(guildID)

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        if (!shop && !shop?.length) {
            this.emit('shopClear', false)
            return false
        }

        this.database.remove(`${guildID}.shop`)
        this.emit('shopClear', true)

        return true
    }

    /**
     * Clears the user's inventory.
     * 
     * [!!!] This method is deprecated.
     * If you want to get all the bugfixes and
     * use the newest inventory features, please
     * switch to the usage of the new InventoryManager.
     * 
     * [!!!] No help will be provided for inventory
     * related methods in ShopManager.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @returns {Boolean} If cleared: true, else: false.
     * @deprecated
     */
    clearInventory(memberID, guildID) {
        if (this.options.deprecationWarnings) {
            console.log(
                errors.deprecationWarning(
                    'ShopManager', 'clearInventory',
                    'InventoryManager', 'clear'
                )
            )
        }


        const inventory = this.database.fetch(`${guildID}.${memberID}.inventory`)

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        if (!inventory) return false

        return this.database.remove(`${guildID}.${memberID}.inventory`)
    }

    /**
     * Shows all items in the shop.
     * @param {String} guildID Guild ID.
     * @returns {ShopItem[]} The shop array.
     */
    list(guildID) {
        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        const shop = this.database.fetch(`${guildID}.shop`)
        return shop.map(item => new ShopItem(guildID, this.options, item))
    }

    /**
     * Shows all items in the shop.
     * 
     * This method is an alias for the `ShopManager.list()` method.
     * @param {String} guildID Guild ID.
     * @returns {ShopItem[]} The shop array.
     */
    fetch(guildID) {
        return this.list(guildID)
    }

    /**
     * Searches for the item in the shop.
     * @param {Number | String} itemID Item ID or name.
     * @param {String} guildID Guild ID.
     * @returns {ShopItem} If item not found: null; else: item info object.
     */
    searchItem(itemID, guildID) {

        /**
        * @type {ItemData[]}
        */
        const shop = this.list(guildID)
        const item = shop.find(item => item.id == itemID || item.name == itemID)

        if (typeof itemID !== 'number' && typeof itemID !== 'string') {
            throw new EconomyError(errors.invalidTypes.editItemArgs.itemID + typeof itemID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        if (!item) return null
        return new ShopItem(guildID, this.options, item)
    }

    /**
     * Searches for the item in the shop.
     * 
     * This method is an alias for the `ShopManager.searchItem()` method.
     * @param {Number | String} itemID Item ID or name.
     * @param {String} guildID Guild ID.
     * @returns {ShopItem} If item not found: null; else: item info object.
     */
    findItem(itemID, guildID) {
        return this.searchItem(itemID, guildID)
    }

    /**
     * Searches for the item in the inventory.
     *
     * [!!!] This method is deprecated.
     * If you want to get all the bugfixes and
     * use the newest inventory features, please
     * switch to the usage of the new InventoryManager.
     * 
     * [!!!] No help will be provided for inventory
     * related methods in ShopManager.
     * @param {Number | String} itemID Item ID or name.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @returns {InventoryData} If item not found: null; else: item info object.
     * @deprecated
     */
    searchInventoryItem(itemID, memberID, guildID) {
        if (this.options.deprecationWarnings) {
            console.log(
                errors.deprecationWarning(
                    'ShopManager', 'searchInventoryItem',
                    'InventoryManager', 'searchItem'
                )
            )
        }

        /**
        * @type {InventoryData[]}
        */
        const inventory = this.database.fetch(`${guildID}.${memberID}.inventory`)
        const item = inventory.find(item => item.id == itemID || item.name == itemID)

        if (typeof itemID !== 'number' && typeof itemID !== 'string') {
            throw new EconomyError(errors.invalidTypes.editItemArgs.itemID + typeof itemID)
        }

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        if (!item) return null
        return item
    }

    /**
     * Buys the item from the shop.
     * @param {Number | String} itemID Item ID or name.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @param {String} reason The reason why the money was subtracted. Default: 'received the item from the shop'.
     * 
     * @returns {Boolean | String} 
     * If item bought successfully: true; if item not found, false will be returned; 
     * if user reached the item's max amount: 'max' string.
     */
    buy(itemID, memberID, guildID, reason = 'received the item from the shop') {
        const balance = this.database.fetch(`${guildID}.${memberID}.money`)

        const shop = this.list(guildID)
        const item = shop.find(item => item.id == itemID || item.name == itemID)

        const inventory = this.database.fetch(`${guildID}.${memberID}.inventory`)
        const inventoryItems = inventory.filter(invItem => invItem.name == item.name)


        const dateLocale = this.settings.get('dateLocale', guildID)
            || this.options.dateLocale

        const subtractOnBuy = this.settings.get('subtractOnBuy', guildID)
            || this.options.subtractOnBuy

        const savePurchasesHistory = this.settings.get('savePurchasesHistory', guildID)
            || this.options.savePurchasesHistory


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
        if (item.maxAmount && inventoryItems.length >= item.maxAmount) return 'max'

        const itemData = {
            id: inventory.length ? inventory[inventory.length - 1].id + 1 : 1,
            name: item.name,
            price: item.price,
            message: item.message,
            description: item.description,
            role: item.role || null,
            maxAmount: item.maxAmount,
            date: new Date().toLocaleString(dateLocale)
        }

        if (subtractOnBuy) {
            this.database.subtract(`${guildID}.${memberID}.money`, item.price)

            this.emit('balanceSubtract', {
                type: 'subtract',
                guildID,
                memberID,
                amount: Number(item.price),
                balance: balance - item.price,
                reason
            })
        }

        this.database.push(`${guildID}.${memberID}.inventory`, {
            id: inventory.length ? inventory[inventory.length - 1].id + 1 : 1,
            name: item.name,
            price: item.price,
            message: item.message,
            description: item.description,
            role: item.role || null,
            maxAmount: item.maxAmount,
            date: new Date().toLocaleString(dateLocale)
        })

        if (savePurchasesHistory) {
            const shop = this.database.fetch(`${guildID}.shop`)
            const history = this.database.fetch(`${guildID}.${memberID}.history`)

            const item = shop.find(item => item.id == itemID || item.name == itemID)

            this.database.push(`${guildID}.${memberID}.history`, {
                id: history.length ? history[history.length - 1].id + 1 : 1,
                memberID,
                guildID,
                name: item.name,
                price: item.price,
                role: item.role || null,
                maxAmount: item.maxAmount,
                date: new Date().toLocaleString(dateLocale)
            })
        }

        this.emit('shopItemBuy', itemData)
        return true
    }

    /**
     * Buys the item from the shop.
     * 
     * This method is an alias for the `ShopManager.buy()` method.
     * @param {Number | String} itemID Item ID or name.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @param {String} reason The reason why the money was subtracted. Default: 'received the item from the shop'.
     * 
     * @returns {Boolean | String} 
     * If item bought successfully: true; if item not found, false will be returned; 
     * if user reached the item's max amount: 'max' string.
     */
    buyItem(itemID, memberID, guildID, reason) {
        return this.buy(itemID, memberID, guildID, reason)
    }

    /**
     * Shows all items in user's inventory.
     * 
     * [!!!] This method is deprecated.
     * If you want to get all the bugfixes and
     * use the newest inventory features, please
     * switch to the usage of the new InventoryManager.
     * 
     * [!!!] No help will be provided for inventory
     * related methods in ShopManager.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @returns {InventoryData[]} User's inventory array.
     * @deprecated
     */
    inventory(memberID, guildID) {
        if (this.options.deprecationWarnings) {
            console.log(
                errors.deprecationWarning(
                    'ShopManager', 'inventory',
                    'InventoryManager', 'fetch'
                )
            )
        }

        const inventory = this.database.fetch(`${guildID}.${memberID}.inventory`)

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        return inventory
    }

    /**
     * Uses the item from user's inventory.
     * 
     * [!!!] This method is deprecated.
     * If you want to get all the bugfixes and
     * use the newest inventory features, please
     * switch to the usage of the new InventoryManager.
     * 
     * [!!!] No help will be provided for inventory
     * related methods in ShopManager.
     * @param {Number | String} itemID Item ID or name.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @param {Client} client The Discord Client. [Optional]
     * @returns {String | boolean} Item message or null if item not found.
     * @deprecated
     */
    useItem(itemID, memberID, guildID, client) {
        if (this.options.deprecationWarnings) {
            console.log(
                errors.deprecationWarning(
                    'ShopManager', 'useItem',
                    'InventoryManager', 'useItem'
                )
            )
        }

        /**
         * @type {InventoryData[]}
         */
        const inventory = this.database.fetch(`${guildID}.${memberID}.inventory`)
        const itemIndex = inventory.findIndex(invItem => invItem.id == itemID || invItem.name == itemID)
        const item = inventory[itemIndex]

        if (typeof itemID !== 'number' && typeof itemID !== 'string') {
            throw new EconomyError(errors.invalidTypes.editItemArgs.itemID + typeof itemID)
        }
        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        if (!item) return null

        if (item.role) {
            if (item.role && !client) {
                throw new EconomyError(errors.noClient)
            }

            const guild = client.guilds.cache.get(guildID)
            const roleID = item.role.replace('<@&', '').replace('>', '')

            guild.roles.fetch(roleID).then(role => {
                const member = guild.members.cache.get(memberID)

                member.roles.add(role).catch(err => {
                    if (!role) {
                        return console.error(new EconomyError(errors.roleNotFound + roleID))
                    }

                    console.error(
                        `\x1b[31mFailed to give a role "${guild.roles.cache.get(roleID)?.name}"` +
                        `on guild "${guild.name}" to member ${guild.member(memberID).user.tag}:\x1b[36m`
                    )

                    console.error(err)
                    console.error('\x1b[0m')
                })
            })

            this.database.removeElement(`${guildID}.${memberID}.inventory`, itemIndex + 1)
            this.emit('shopItemUse', item)

            return item.message
        }
    }

    /**
     * Shows the user's purchase history.
     * 
     * [!!!] This method is deprecated.
     * If you want to get all the bugfixes and
     * use the newest history features, please
     * switch to the usage of the new HistoryManager.
     * 
     * [!!!] No help will be provided for history
     * related methods in ShopManager.
     * @param {String} memberID Member ID
     * @param {String} guildID Guild ID
     * @returns {HistoryData[]} User's purchase history.
     * @deprecated
     */
    history(memberID, guildID) {
        if (this.options.deprecationWarnings) {
            console.log(
                errors.deprecationWarning(
                    'ShopManager', 'history',
                    'HistoryManager', 'fetch'
                )
            )
        }

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

        return history
    }

    /**
    * Clears the user's purchases history.
    * 
    * [!!!] This method is deprecated.
    * If you want to get all the bugfixes and
    * use the newest history features, please
    * switch to the usage of the new HistoryManager.
    * 
    * [!!!] No help will be provided for history
    * related methods in ShopManager.
    * @param {String} memberID Member ID.
    * @param {String} guildID Guild ID.
    * @returns {Boolean} If cleared: true, else: false.
    * @deprecated
    */
    clearHistory(memberID, guildID) {
        if (this.options.deprecationWarnings) {
            console.log(
                errors.deprecationWarning(
                    'ShopManager', 'clearHistory',
                    'HistoryManager', 'clear'
                )
            )
        }

        const history = this.database.fetch(`${guildID}.${memberID}.history`)

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        if (!history) return false

        return this.database.remove(`${guildID}.${memberID}.history`)
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

/**
 * Shop manager class.
 * @type {ShopManager}
 */
module.exports = ShopManager