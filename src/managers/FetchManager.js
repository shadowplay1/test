const { readFileSync, writeFileSync, existsSync } = require('fs')

const errors = require('../structures/errors')

const EconomyError = require('../classes/util/EconomyError')

const ShopItem = require('../classes/ShopItem')
const InventoryItem = require('../classes/InventoryItem')
const HistoryItem = require('../classes/HistoryItem')

/**
* Fetch manager methods class.
*/
class FetchManager {

    /**
     * Fetch Manager.
     * @param {Object} options Economy configuration.
     * @param {String} options.storagePath Full path to a JSON file. Default: './storage.json'.
     */
    constructor(options = {}) {

        /**
         * Economy configuration.
         * @type {EconomyOptions}
         * @private
         */
        this.options = options

        /**
         * Full path to a JSON file.
         * @type {String}
         * @private
         */
        this.storagePath = options.storagePath || './storage.json'
    }

    /**
    * Fetches the entire database.
    * @returns {Object} Database contents
    */
    fetchAll() {
        const isFileExisting = existsSync(this.storagePath)

        if (!isFileExisting) writeFileSync(this.storagePath, '{}')

        const fileData = readFileSync(this.storagePath)
        const stringData = fileData.toString()

        return JSON.parse(stringData)
    }

    /**
    * Fetches the user's balance.
    * @param {String} memberID Member ID
    * @param {String} guildID Guild ID
    * @returns {Number} User's balance.
    */
    fetchBalance(memberID, guildID) {
        const data = this.fetchAll()

        if (typeof memberID !== 'string') throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        if (typeof guildID !== 'string') throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)

        const guildData = data[guildID]
        const memberData = guildData?.[memberID]

        /**
         * @type {Number}
         */
        const money = memberData?.money || 0

        return money
    }

    /**
     * Fetches the user's bank balance.
     * @param {String} memberID Member ID
     * @param {String} guildID Guild ID
     * @returns {Number} User's bank balance.
     */
    fetchBank(memberID, guildID) {
        const data = this.fetchAll()

        if (typeof memberID !== 'string') throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        if (typeof guildID !== 'string') throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)

        const guildData = data[guildID]
        const memberData = guildData?.[memberID]

        /**
         * @type {Number}
         */
        const bankMoney = memberData?.bank || 0

        return bankMoney
    }

    /**
     * Fetches the user's inventory.
     * @param {String} memberID Member ID
     * @param {String} guildID Guild ID
     * @returns {InventoryItem[]} User's inventory.
     */
    fetchInventory(memberID, guildID) {
        const data = this.fetchAll()

        if (typeof memberID !== 'string') throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        if (typeof guildID !== 'string') throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)

        const guildData = data[guildID]
        const memberData = guildData?.[memberID]

        /**
         * @type {InventoryData[]}
         */
        const inventory = memberData?.inventory || []

        return inventory.map(item => new InventoryItem(guildID, memberID, this.options, item))
    }

    /**
     * Fetches the user's purchases history.
     * @param {String} memberID Member ID
     * @param {String} guildID Guild ID
     * @returns {HistoryItem[]} User's purchases history.
     */
    fetchHistory(memberID, guildID) {
        const data = this.fetchAll()

        if (typeof memberID !== 'string') throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        if (typeof guildID !== 'string') throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)

        const guildData = data[guildID]
        const memberData = guildData?.[memberID]

        /**
         * @type {HistoryData[]}
         */
        const history = memberData?.history || []

        return history.map(item => new HistoryItem(guildID, this.options, item))
    }

    /**
     * Fetches the user's cooldowns.
     * @param {String} memberID Member ID
     * @param {String} guildID Guild ID
     * @returns {CooldownData} User's cooldowns object.
     */
    fetchCooldowns(memberID, guildID) {
        const data = this.fetchAll()

        if (typeof memberID !== 'string') throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        if (typeof guildID !== 'string') throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)

        const guildData = data[guildID]
        const memberData = guildData?.[memberID]

        const dailyCooldown = memberData?.dailyCooldown
        const workCooldown = memberData?.workCooldown
        const weeklyCooldown = memberData?.weeklyCooldown

        return {
            dailyCooldown,
            workCooldown,
            weeklyCooldown
        }
    }

    /**
     * Shows all items in the shop.
     * @param {String} guildID Guild ID
     * @returns {ShopItem[]} The shop array.
     */
    fetchShop(guildID) {
        const data = this.fetchAll()

        if (typeof guildID !== 'string') throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)

        const guildData = data[guildID]
        const shop = guildData?.shop || []

        return new ShopItem(guildID, this.options, shop)
    }
}

/**
 * @typedef {Object} CooldownData User's cooldown data.
 * @property {Number} dailyCooldown User's daily cooldown.
 * @property {Number} workCooldown User's work cooldown.
 * @property {Number} weeklyCooldown User's weekly cooldown.
 */

/**
 * @typedef {Object} HistoryData History data object.
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
 * @typedef {Object} InventoryData Inventory data object.
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
 * Fetch manager class.
 * @type {FetchManager}
 */
module.exports = FetchManager
