const EconomyError = require('../classes/util/EconomyError')
const Emitter = require('../classes/util/Emitter')

const FetchManager = require('./FetchManager')
const DatabaseManager = require('./DatabaseManager')
const BalanceManager = require('./BalanceManager')

const errors = require('../structures/errors')

/**
 * Inventory manager methods class.
 */
class InventoryManager extends Emitter {

    /**
      * Inventory Manager.
      * @param {Object} options Economy configuration.
      * @param {String} options.storagePath Full path to a JSON file. Default: './storage.json'.
      * @param {String} options.dateLocale The region (example: 'ru' or 'en') to format date and time. Default: 'en'.
      * @param {Boolean} options.subtractOnBuy 
      * If true, when someone buys the item, their balance will subtract by item price.
     */
    constructor(options = {}) {
        super()


        /**
         * Economy configuration.
         * @private
         * @type {?EconomyOptions}
         */
        this.options = options

        /**
         * Database manager methods object.
         * @type {DatabaseManager}
         * @private
         */
        this.database = new DatabaseManager(options)

        /**
         * Balance manager methods object.
         * @type {BalanceManager}
         * @private
         */
        this.balance = new BalanceManager(options)

        /**
         * Fetch manager methods object.
         * @type {FetchManager}
         * @private
         */
        this.fetcher = new FetchManager(options)
    }

    /**
     * Clears the user's inventory.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @returns {Boolean} If cleared: true, else: false.
     */
    clear(memberID, guildID) {
        const inventory = this.fetch(memberID, guildID)

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
     * Searches for the item in the inventory.
     * @param {String | Number} itemID Item ID or name.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @returns {InventoryData} If item not found: null; else: item info object.
     */
    searchItem(itemID, memberID, guildID) {

        /**
        * @type {InventoryData[]}
        */
        const inventory = this.fetch(memberID, guildID)
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
     * Searches for the item in the inventory.
     * 
     * This method is an alias for the `InventoryManager.searchItem()` method.
     * @param {Number | String} itemID Item ID or name.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @returns {InventoryData} If item not found: null; else: item info object.
     */
    findItem(itemID, memberID, guildID) {
        return this.searchItem(itemID, memberID, guildID)
    }

    /**
     * Fetches the user's inventory.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @returns {InventoryData[]} User's inventory array.
     */
    fetch(memberID, guildID) {
        const inventory = this.fetcher.fetchInventory(memberID, guildID)

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        return inventory
    }

    /**
     * Fetches the user's inventory.
     * 
     * This method is an alias for the `InventoryManager.fetch()` method.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @returns {InventoryData[]} User's inventory array.
     */
    get(memberID, guildID) {
        return this.fetch(memberID, guildID)
    }

    /**
     * Uses the item from user's inventory.
     * @param {Number | String} itemID Item ID or name.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @param {Client} [client] Discord Client [Specify if the role will be given in a discord server].
     * @returns {String} Item message.
     */
    useItem(itemID, memberID, guildID, client) {

        /**
         * @type {InventoryData[]}
         */
        const inventory = this.fetch(memberID, guildID)

        const itemObject = this.searchItem(itemID, memberID, guildID)
        const itemIndex = inventory.findIndex(invItem => invItem.id == itemObject?.id)

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
        }

        this.removeItem(itemID, memberID, guildID)
        this.emit('shopItemUse', item)

        let msg
        const string = item?.message || 'You have used this item!'

        if (string?.includes('[random=')) {
            const s = string.slice(string.indexOf('[')).replace('random=', '')

            let errored = false
            let arr

            try {
                arr = JSON.parse(s.slice(0, s.indexOf(']') + 1))
            } catch {
                errored = true
            }

            if (errored || !arr.length) msg = string
            else {
                const randomString = arr[Math.floor(Math.random() * arr.length)]
                const replacingString = string.slice(string.indexOf('['))


                msg = string.replace(replacingString, randomString) +
                    string.slice(string.indexOf('"]')).replace('"]', '')
            }
        }

        else msg = string
        return msg
    }

    /**
     * Uses the item from user's inventory.
     * 
     * This method is an alias for the `InventoryManager.useItem()` method.
     * @param {Number | String} itemID Item ID or name.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @param {Client} [client] The Discord Client. [Specify if the role will be given in a discord server].
     * @returns {String} Item message.
     */
    use(itemID, memberID, guildID, client) {
        return this.useItem(itemID, memberID, guildID, client)
    }

    /**
     * Removes the item from user's inventory.
     * @param {String | Number} itemID Item ID or name.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @returns {Boolean} If removed successfully: true, else: false.
     */
    removeItem(itemID, memberID, guildID) {

        /**
        * @type {InventoryData[]}
        */
        const inventory = this.fetch(memberID, guildID)

        const item = this.searchItem(itemID, memberID, guildID)
        const itemIndex = inventory.findIndex(invItem => invItem.id == item?.id)

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

        return this.database
            .removeElement(`${guildID}.${memberID}.inventory`, itemIndex)
    }

    /**
     * Adds the item from the shop to user's inventory.
     * @param {String | Number} itemID Item ID or name.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @returns {Boolean} If added successfully: true, else: false.
     */
    addItem(itemID, memberID, guildID) {

        /**
        * @type {ItemData[]}
        */
        const shop = this.fetcher.fetchShop(guildID)
        const item = shop.find(shopItem => shopItem.id == itemID || shopItem.name == itemID)

        /**
        * @type {InventoryData[]}
        */
        const inventory = this.fetcher.fetchInventory(memberID, guildID)
        const inventoryItems = inventory.filter(invItem => invItem.name == item.name)

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
            date: new Date().toLocaleString(this.options.dateLocale || 'en')
        }

        return this.database.push(`${guildID}.${memberID}.inventory`, itemData)
    }

    /**
     * Removes the item from user's inventory
     * and adds its price to the user's balance.
     * This is the same as selling something.
     * @param {String | Number} itemID Item ID or name.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @param {String} [reason='sold the item from the inventory'] The reason why the item was sold.
     * @returns {Number} The price the item was sold for.
     */
    sellItem(itemID, memberID, guildID, reason = 'sold the item from the inventory') {
        const item = this.searchItem(itemID, memberID, guildID)

        const percent = this.database.fetch(`${guildID}.settings.sellingItemPercent`)
            || this.options.sellingItemPercent

        const sellingPrice = Math.floor((item?.price / 100) * percent)


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

        this.balance
            .add(sellingPrice, memberID, guildID, reason)

        this.removeItem(itemID, memberID, guildID)
        return sellingPrice
    }

    /**
     * Removes the item from user's inventory
     * and adds its price to the user's balance.
     * This is the same as selling something.
     * 
     * This method is an alias for 'InventoryManager.sellItem()' method.
     * @param {String | Number} itemID Item ID or name.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @param {String} [reason='sold the item from the inventory'] The reason why the item was sold.
     * @returns {Number} The price the item was sold for.
     */
    sell(itemID, memberID, guildID, reason = 'sold the item from the inventory') {
        return this.sellItem(itemID, memberID, guildID, reason)
    }
}

/**
 * @typedef {Object} AddItemOptions Configuration with item info for 'Economy.shop.addItem' method.
 * @property {String} name Item name.
 * @property {Number} price Item price.
 * @property {String} [message='You have used this item!'] Item message that will be returned on use.
 * @property {String} [description='Very mysterious item.'] Item description.
 * @property {Number} [maxAmount=null] Max amount of the item that user can hold in their inventory.
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
 * @property {Number} [sellingItemPercent=75]
 * Percent of the item's price it will be sold for. Default: 75.
 * 
 * @property {Boolean} [deprecationWarnings=true] 
 * If true, the deprecation warnings will be sent in the console.
 * 
 * @property {Boolean} [savePurchasesHistory=true] If true, the module will save all the purchases history.
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
 * Inventory manager class.
 * @type {InventoryManager}
 */
module.exports = InventoryManager