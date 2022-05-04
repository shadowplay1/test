const EconomyError = require('../util/EconomyError')
const errors = require('../../structures/errors')

const DatabaseManager = require('../../managers/DatabaseManager')
const BaseManager = require('../../managers/BaseManager')

const InventoryItem = require('../InventoryItem')


/**
 * User inventory class.
 */
class Inventory extends BaseManager {
    constructor(memberID, guildID, options) {
        super(options, InventoryItem)

        /**
        * Member ID.
        * @type {String}
        */
        this.memberID = memberID

        /**
         * Guild ID.
         * @type {String}
         */
        this.guildID = guildID

        /**
         * Economy options.
         * @type {EconomyOptions}
         * @private
         */
        this.options = options

        /**
         * Database Manager.
         * @type {DatabaseManager}
         * @private
         */
        this.database = new DatabaseManager(options)
    }

    /**
     * Gets the item from user's inventory.
     * @param {string | number} itemID Item ID.
     * @returns {InventoryItem} User's inventory item.
     */
    get(itemID) {
        return this.fetch().find(item => item.id == itemID)
    }

    /**
     * Gets all the items in user's inventory.
     * 
     * This method is an alias for 'EconomyUser.inventory.fetch' nethod.
     * @returns {InventoryItem[]} User's inventory array.
     */
    all() {
        return this.fetch()
    }

    /**
     * Uses the item from user's inventory.
     * @param {String | Number} itemID Item ID.
     * @param {any} [client] Discord Client [Specify if the role will be given in a discord server].
     * @returns {String} Item message or null if item not found.
     */
    use(itemID, client) {
        const inventory = this.fetch(memberID, guildID)

        const itemObject = this.searchItem(itemID, memberID, guildID)
        const itemIndex = inventory.findIndex(invItem => invItem.id == itemObject?.id)

        const item = inventory[itemIndex]

        if (typeof itemID !== 'number' && typeof itemID !== 'string') {
            throw new EconomyError(errors.invalidTypes.editItemArgs.itemID + typeof itemID)
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

        let msg
        const string = item?.message || 'You have used this item!'

        if (string.includes('[random=')) {
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

        this.emit('shopItemUse', item)
        return msg
    }

    /**
     * Adds the item from the shop to user's inventory.
     * @param {String | Number} itemID Item ID.
     * @returns {Boolean} If added successfully: true, else: false.
     */
    add(itemID) {

        /**
         * @type {ItemData[]}
         */
        const shop = this.database.set(`${this.guildID}.shop`)
        const item = shop.find(shopItem => shopItem.id == itemID || shopItem.name == itemID)

        /**
        * @type {InventoryData[]}
        */
        const inventory = this.fetcher.fetchInventory(memberID, guildID)
        const inventoryItems = inventory.filter(invItem => invItem.name == item.name)

        if (typeof itemID !== 'number' && typeof itemID !== 'string') {
            throw new EconomyError(errors.invalidTypes.editItemArgs.itemID + typeof itemID)
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
     * Removes the item from user's inventory.
     * @param {String | Number} itemID Item ID.
     * @returns {Boolean} If removed successfully: true, else: false.
     */
    removeItem(itemID) {
        const inventory = this.fetch(memberID, guildID)

        const item = this.searchItem(itemID, memberID, guildID)
        const itemIndex = inventory.findIndex(invItem => invItem.id == item?.id)

        if (typeof itemID !== 'number' && typeof itemID !== 'string') {
            throw new EconomyError(errors.invalidTypes.editItemArgs.itemID + typeof itemID)
        }

        if (!item) return false
        return this.database.removeElement(`${guildID}.${memberID}.inventory`, itemIndex)
    }

    /**
     * Clears the user's inventory.
     * @returns {Boolean} If cleared: true, else: false.
     */
    clear() {
        const inventory = this.fetch(this.memberID, this.guildID)
        if (!inventory) return false

        return this.database.remove(`${this.guildID}.${this.memberID}.inventory`)
    }

    /**
     * Fetches the user's inventory.
     * @returns {InventoryItem[]} User's inventory array.
     */
    fetch() {
        return this.database.fetch(`${this.guildID}.${this.memberID}.inventory`) || []
    }

    /**
     * Gets the item from user's inventory.
     * 
     * This method is an alias for 'EconomyUser.inventory.get()' method.
     * @param {string | number} itemID Item ID.
     * @returns {InventoryItem} User's inventory item.
     */
    findItem(itemID) {
        return this.get(itemID)
    }
}

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
 * User inventory class.
 * @type {Inventory}
 */
module.exports = Inventory