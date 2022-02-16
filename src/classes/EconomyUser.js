const UtilsManager = require('../managers/UtilsManager')
const DatabaseManager = require('../managers/DatabaseManager')

const HistoryManager = require('../managers/HistoryManager')
const ShopManager = require('../managers/ShopManager')
const InventoryManager = require('../managers/InventoryManager')

const BalanceManager = require('../managers/BalanceManager')
const BankManager = require('../managers/BankManager')
const BaseManager = require('../managers/BaseManager')

/**
* Economy user class.
*/
class EconomyUser {

    /**
     * Economy user class.
     * @param {String} id User's ID.
     * @param {String} guildID Guild ID.
     * @param {EconomyOptions} ecoOptions Economy options object.
     * @param {EconomyUserData} userObject Economy user object.
     */
    constructor(id, guildID, ecoOptions, userObject) {

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
         * User's daily cooldown.
         * @type {Number}
         */
        this.dailyCooldown = userObject.dailyCooldown

        /**
         * User's work cooldown.
         * @type {Number}
         */
        this.workCooldown = userObject.workCooldown

        /**
         * User's weekly cooldown.
         * @type {Number}
         */
        this.weeklyCooldown = userObject.weeklyCooldown


        /**
         * User's balance.
         * @type {Number}
         */
        this.money = userObject.money


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
        this.shop = new ShopManager(ecoOptions)

        /**
         * History class.
         * @type {History}
         */
        this.history = new History(this.id, guildID, this.storagePath)

        /**
         * Inventory class.
         * @type {Inventory}
         */
        this.inventory = new Inventory(this.id, guildID, this.storagePath)

        /**
         * Balance class.
         * @type {Balance}
         */
        this.balance = new Balance(this.id, guildID, this.storagePath)

        /**
         * Bank balance class.
         * @type {Bank}
         */
        this.bank = new Bank(this.id, guildID, this.storagePath)

        for (const [key, value] of Object.entries(userObject || {})) {
            this[key] = value
        }
    }

    /**
     * Deletes the user from database.
     * @returns {EconomyUser} Deleted user object.
     */
    delete() {
        this.utils.removeUser(id, this.guildID)
        return this
    }

    /**
     * Sets the default user object for a specified member.
     * @returns {Boolean} If reset successfully: true; else: false.
     */
    reset() {
        return this.utils.reset(id, this.guildID)
    }
}

class Base {
    constructor(memberID, guildID) {

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
    }
}

class History extends BaseManager {
    constructor(memberID, guildID, storagePath) {
        super(memberID, guildID)

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
         * History Manager.
         * @type {HistoryManager}
         * @private
         */
        this.history = new HistoryManager({ storagePath })
    }

    /**
    * Gets the item from user's purchases history.
    * @param {string | number} id History item ID.
    * @returns {InventoryData} User's purchases history.
    */
    get(id) {
        return this.history
            .fetch(this.memberID, this.guildID)
            .find(x => x.id == id)
    }

    /**
     * Gets all the items in user's purchases history.
     * @returns {InventoryData[]} User's purchases history.
     */
    all() {
        return this.inventory.fetch(this.memberID, this.guildID)
    }

    /**
     * Adds the item from the shop to the purchases history.
     * @param {String | Number} id Shop item ID.
     * @returns {Boolean} If added: true, else: false.
     */
    add(id) {
        return this.history.add(id, this.memberID, this.guildID)
    }

    /**
     * Removes the specified item from purchases history.
     * @param {String | Number} id History item ID.
     * @returns {Boolean} If removed: true, else: false.
     */
    remove(id) {
        return this.history.remove(id, this.memberID, this.guildID)
    }

    /**
     * Removes the specified item from purchases history.
     * 
     * This method is an alias for `EconomyUser.history.remove()` method.
     * @param {String | Number} id History item ID.
     * @returns {Boolean} If removed: true, else: false.
     */
    delete(id) {
        return this.history.delete(id, this.memberID, this.guildID)
    }

    /**
     * Clears the user's purchases history.
     * @returns {Boolean} If cleared: true, else: false.
     */
    clear() {
        return this.history.clear(this.memberID, this.guildID)
    }

    /**
     * Searches for the specified item from history.
     * @param {String | Number} id History item ID.
     * @returns {HistoryData} Purchases history item.
     */
    find(id) {
        return this.history.find(id, this.memberID, this.guildID)
    }

    /**
    * Searches for the specified item from history.
    * 
    * This method is an alias for the `EconomyUser.history.find()` method.
    * @param {String | Number} id History item ID.
    * @returns {HistoryData} Purchases history item.
    */
    search(id) {
        return this.history.search(id, this.memberID, this.guildID)
    }

    /**
     * Shows the user's purchase history.
     * 
     * This method is an alias for `EconomyUser.history.fetch()` method.
     * @returns {HistoryData} User's purchase history.
     */
    get() {
        return this.history.fetch(this.memberID, this.guildID)
    }

    /**
     * Shows the user's purchase history.
     * @returns {HistoryData} User's purchase history.
     */
    fetch() {
        return this.history.fetch(this.memberID, this.guildID)
    }

    /**
    * Shows the user's purchases history.
    * @returns {HistoryData[]} User's purchases history.
    */
    fetch() {
        return this.history.fetch(this.memberID, this.guildID)
    }

    /**
    * Shows the user's purchases history.
    * 
    * This method is an alias for `EconomyUser.history.fetch()` method.
    * @returns {HistoryData[]} User's purchases history.
    */
    list() {
        return this.history.list(this.memberID, this.guildID)
    }
}

class Inventory extends BaseManager {
    constructor(memberID, guildID, storagePath) {
        super(memberID, guildID)

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
         * Inventory Manager.
         * @type {InventoryManager}
         * @private
         */
        this.inventory = new InventoryManager({ storagePath })
    }

    /**
     * Gets the item from user's inventory.
     * @param {string | number} itemID Item ID.
     * @returns {InventoryData} User's inventory item.
     */
    get(itemID) {
        return this.inventory
            .fetch(this.memberID, this.guildID)
            .find(x => x.id == itemID)
    }

    /**
     * Gets all the items in user's inventory.
     * @returns {InventoryData[]} User's inventory array.
     */
    all() {
        return this.inventory.fetch(this.memberID, this.guildID)
    }

    /**
     * Uses the item from user's inventory.
     * @param {String | Number} itemID Item ID.
     * @param {any} [client] Discord Client [Specify if the role will be given in a server].
     * @returns {String} Item message or null if item not found.
     */
    use(itemID, client) {
        return this.inventory.useItem(itemID, this.memberID, this.guildID, client)
    }

    /**
     * Adds the item from the shop to user's inventory.
     * @param {String | Number} itemID Item ID.
     * @returns {Boolean} If added successfully: true, else: false.
     */
    add(itemID) {
        return this.inventory.addItem(itemID, this.memberID, this.guildID)
    }

    /**
     * Removes the item from user's inventory.
     * @param {String | Number} itemID Item ID.
     * @returns {Boolean} If removed successfully: true, else: false.
     */
    remove(itemID) {
        return this.inventory.removeItem(itemID, this.memberID, this.guildID)
    }

    /**
     * Clears the user's inventory.
     * @returns {Boolean} If cleared: true, else: false.
     */
    clear() {
        return this.inventory.clear(this.memberID, this.guildID)
    }

    /**
     * Fetches the user's inventory.
     * @returns {InventoryData[]} User's inventory array.
     */
    fetch() {
        return this.inventory.fetch(this.memberID, this.guildID)
    }

    /**
     * Fetches the user's inventory.
     * 
     * This method is an alias for the BaseManager.all() method.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @returns {InventoryData[]} User's inventory array.
     */
    list() {
        return this.inventory.list(this.memberID, this.guildID)
    }

    /**
     * Fetches the user's inventory.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @returns {InventoryData[]} User's inventory array.
     */
    fetch() {
        return this.inventory.fetch(this.memberID, this.guildID)
    }
}

class Balance extends Base {
    constructor(memberID, guildID, storagePath) {
        super(memberID, guildID)

        this.balance = new BalanceManager({ storagePath })
    }

    /**
     * Sets the money amount on user's balance.
     * @param {Number} amount Money amount
     * @param {String} [reason] The reason why you set the money.
     * @returns {Number} Money amount
     */
    set(amount, reason) {
        return this.balance.set(amount, this.memberID, this.guildID, reason)
    }

    /**
     * Adds the money amount on user's balance.
     * @param {Number} amount Money amount.
     * @param {String} [reason] The reason why you add the money.
     * @returns {Number} Money amount.
     */
    add(amount, reason) {
        return this.balance.add(amount, this.memberID, this.guildID, reason)
    }

    /**
     * Subtracts the money amount on user's balance.
     * @param {Number} amount Money amount.
     * @param {String} [reason] The reason why you subtract the money.
     * @returns {Number} Money amount.
     */
    subtract(amount, reason) {
        return this.balance.subtract(amount, this.memberID, this.guildID, reason)
    }

    /**
     * Fetches the user's balance.
     * @returns {Number} User's balance.
     */
    get() {
        return this.balance.fetch(this.memberID, this.guildID)
    }

    /**
     * Sends the money to a specified user.
     * @param {Number} amount Amount of money to send.
     * @param {String} senderMemberID A member ID who will send the money.
     * @param {String} sendingReason 
     * The reason of subtracting the money from sender. (example: "sending money to {user}")
     * 
     * @param {String} receivingReason 
     * The reason of adding a money to recipient. (example: "receiving money from {user}")
     * 
     * @returns {Number} How much money was sent.
     */
    pay(amount, senderMemberID, sendingReason, receivingReason) {
        return this.balance.pay(this.guildID, {
            amount,
            senderMemberID,
            recipientMemberID: this.memberID,
            sendingReason,
            receivingReason
        })
    }
}

class Bank extends Base {
    constructor(memberID, guildID, storagePath) {
        super(memberID, guildID)

        this.bank = new BankManager({ storagePath })
    }

    /**
     * Sets the money amount on user's bank balance.
     * @param {Number} amount Money amount
     * @param {String} [reason] The reason why you set the money.
     * @returns {Number} Money amount
     */
    set(amount, reason) {
        return this.bank.set(amount, this.memberID, this.guildID, reason)
    }

    /**
     * Adds the money amount on user's bank balance.
     * @param {Number} amount Money amount.
     * @param {String} [reason] The reason why you add the money.
     * @returns {Number} Money amount.
     */
    add(amount, reason) {
        return this.bank.add(amount, this.memberID, this.guildID, reason)
    }

    /**
     * Subtracts the money amount on user's bank balance.
     * @param {Number} amount Money amount.
     * @param {String} [reason] The reason why you subtract the money.
     * @returns {Number} Money amount.
     */
    subtract(amount, reason) {
        return this.bank.subtract(amount, this.memberID, this.guildID, reason)
    }

    /**
     * Fetches the user's bank balance.
     * @returns {Number} User's bank balance.
     */
    get() {
        return this.bank.fetch(this.memberID, this.guildID)
    }
}

/**
 * @typedef {Object} EconomyUserData Economy user object.
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
 * @property {String} itemName Item name.
 * @property {Number} price Item price.
 * @property {String} message The message that will be returned on item use.
 * @property {String} role ID of Discord Role that will be given to user on item use.
 * @property {Number} maxAmount Max amount of the item that user can hold in his inventory.
 * @property {String} date Date when the item was bought.
 */

/**
 * History data object.
 * @typedef {Object} HistoryData
 * @property {Number} id Item ID in history.
 * @property {String} itemName Item name.
 * @property {Number} price Item price.
 * @property {String} message The message that will be returned on item use.
 * @property {String} role ID of Discord Role that will be given to user on item use.
 * @property {String} date Date when the item was bought.
 * @property {String} memberID Member ID.
 * @property {String} guildID Guild ID.
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
 * Economy user class.
 * @type {EconomyUser}
 */
module.exports = EconomyUser