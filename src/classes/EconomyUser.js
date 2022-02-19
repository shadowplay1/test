const UtilsManager = require('../managers/UtilsManager')
const DatabaseManager = require('../managers/DatabaseManager')

const BaseManager = require('../managers/BaseManager')
const FetchManager = require('../managers/FetchManager')

const InventoryItem = require('./InventoryItem')

const EconomyError = require('./util/EconomyError')
const errors = require('../structures/errors')

const HistoryItem = require('./HistoryItem')
const ShopManager = require('../managers/ShopManager')

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
         * Economy options object.
         * @type {EconomyOptions}
         * @private
         */
        this.options = ecoOptions

        /**
         * Utils Manager.
         * @type {UtilsManager}
         * @private
         */
        this.utils = new UtilsManager(ecoOptions)

        /**
         * Utils Manager.
         * @type {DatabaseManager}
         * @private
         */
        this.database = new DatabaseManager(ecoOptions)

        /**
         * Shop Manager.
         * @type {ShopManager}
         * @private
         */
        this._shop = new ShopManager(this.options)

        /**
         * History class.
         * @type {History}
         */
        this.history = new History(this.id, guildID, ecoOptions)

        /**
         * Inventory class.
         * @type {Inventory}
         */
        this.inventory = new Inventory(this.id, guildID, ecoOptions)

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

    /**
     * Buys the item from the shop.
     * @param {String | Number} itemID Item ID or name.
     * 
     * @returns {Boolean} 
     * If item bought successfully: true; if item not found, false will be returned; 
     * if user reached the item's max amount: 'max' string.
     */
    buyItem(itemID) {
        return this._shop.buy(itemID, this.id, this.guildID)
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
    constructor(memberID, guildID, options) {
        super(options)

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
         * Fetch Manager.
         * @type {FetchManager}
         * @private
         */
        this._fetcher = new FetchManager(options)

        /**
         * Database Manager.
         * @type {DatabaseManager}
         * @private
         */
        this.database = new DatabaseManager(options)
    }

    /**
    * Gets the item from user's purchases history.
    * @param {string | number} id History item ID.
    * @returns {HistoryItem} User's purchases history.
    */
    get(id) {
        return this.all().find(item => item.id == id)
    }

    /**
     * Gets all the items in user's purchases history.
     * @returns {HistoryItem[]} User's purchases history.
     */
    all() {
        const results = this.database.fetch(`${this.guildID}.${this.memberID}.history`) || []
        return results
    }

    /**
     * Adds the item from the shop to the purchases history.
     * @param {String | Number} id Shop item ID.
     * @returns {Boolean} If added: true, else: false.
     */
    add(itemID) {
        const shop = this.database.fetch(`${this.guildID}.shop`)
        const history = this.database.fetch(`${this.guildID}.${this.memberID}.history`)

        const item = shop.find(item => item.id == itemID || item.itemName == itemID)


        if (typeof itemID !== 'number' && typeof itemID !== 'string') {
            throw new EconomyError(errors.invalidTypes.editItemArgs.itemID + typeof itemID)
        }

        if (!item) return false

        return this.database.push(`${this.guildID}.${this.memberID}.history`, {
            id: history.length ? history[history.length - 1].id + 1 : 1,
            memberID: this.memberID,
            guildID: this.guildID,
            itemName: item.itemName,
            price: item.price,
            role: item.role || null,
            maxAmount: item.maxAmount,
            date: new Date().toLocaleString(this.options.dateLocale || 'en')
        })
    }

    /**
     * Removes the specified item from purchases history.
     * @param {String | Number} id History item ID.
     * @returns {Boolean} If removed: true, else: false.
     */
    remove(id) {
        if (typeof id !== 'number' && typeof id !== 'string') {
            throw new EconomyError(errors.invalidTypes.id + typeof id)
        }

        const history = this.fetch(memberID, guildID)
        const historyItem = this.find(id, memberID, guildID)

        const historyItemIndex = history.findIndex(histItem => histItem.id == historyItem.id)

        if (!historyItem) return false
        history.splice(historyItemIndex, 1)

        return this.database.set(`${this.guildID}.${this.memberID}.history`, history)
    }

    /**
     * Removes the specified item from purchases history.
     * 
     * This method is an alias for `EconomyUser.history.remove()` method.
     * @param {String | Number} id History item ID.
     * @returns {Boolean} If removed: true, else: false.
     */
    delete(id) {
        return this.remove(id)
    }

    /**
     * Clears the user's purchases history.
     * @returns {Boolean} If cleared: true, else: false.
     */
    clear() {
        const history = this.all()

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        if (!history) return false
        return this.database.remove(`${this.guildID}.${this.memberID}.history`)
    }

    /**
     * Searches for the specified item from history.
     * @param {String | Number} id History item ID.
     * @returns {HistoryItem} Purchases history item.
     */
    findItem(id) {
        return this.get(id)
    }

    /**
    * Searches for the specified item from history.
    * 
    * This method is an alias for the `EconomyUser.history.findItem()` method.
    * @param {String | Number} id History item ID.
    * @returns {HistoryItem} Purchases history item.
    */
    search(id) {
        return this.find(id)
    }

    /**
     * Shows the user's purchase history.
     * 
     * This method is an alias for the `EconomyUser.history.all()` method.
     * @returns {HistoryItem} User's purchase history.
     */
    fetch() {
        return this.all()
    }
}

class Inventory extends BaseManager {
    constructor(memberID, guildID, options) {
        super(options)

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
        const item = shop.find(shopItem => shopItem.id == itemID || shopItem.itemName == itemID)

        /**
        * @type {InventoryData[]}
        */
        const inventory = this.fetcher.fetchInventory(memberID, guildID)
        const inventoryItems = inventory.filter(invItem => invItem.itemName == item.itemName)

        if (typeof itemID !== 'number' && typeof itemID !== 'string') {
            throw new EconomyError(errors.invalidTypes.editItemArgs.itemID + typeof itemID)
        }

        if (!item) return false
        if (item.maxAmount && inventoryItems.length >= item.maxAmount) return 'max'

        const itemData = {
            id: inventory.length ? inventory[inventory.length - 1].id + 1 : 1,
            itemName: item.itemName,
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
    remove(itemID) {
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

class Balance extends Base {
    constructor(memberID, guildID, storagePath) {
        super(memberID, guildID)

        this.database = new DatabaseManager({ storagePath })
    }

    /**
     * Sets the money amount on user's balance.
     * @param {Number} amount Money amount
     * @param {String} [reason] The reason why you set the money.
     * @returns {Number} Money amount
     */
    set(amount/* , reason */) {
        // const balance = this.get()

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        }

        this.database.set(`${this.guildID}.${this.memberID}.money`, amount)

        // this.emit('balanceSet', {
        //     type: 'set',
        //     guildID: this.guildID,
        //     memberID: this.memberID,
        //     amount: Number(amount),
        //     balance,
        //     reason
        // })

        return amount
    }

    /**
     * Adds the money amount on user's balance.
     * @param {Number} amount Money amount.
     * @param {String} [reason] The reason why you add the money.
     * @returns {Number} Money amount.
     */
    add(amount/* , reason */) {
        // const balance = this.get()

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        }

        this.database.add(`${this.guildID}.${this.memberID}.money`, amount)

        // this.emit('balanceAdd', {
        //     type: 'add',
        //     guildID: this.guildID,
        //     memberID: this.memberID,
        //     amount: Number(amount),
        //     balance: balance + amount,
        //     reason
        // })

        return amount
    }

    /**
     * Subtracts the money amount on user's balance.
     * @param {Number} amount Money amount.
     * @param {String} [reason] The reason why you subtract the money.
     * @returns {Number} Money amount.
     */
    subtract(amount/* , reason */) {
        // const balance = this.get()

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        }

        this.database.subtract(`${this.guildID}.${this.memberID}.money`, amount)

        // this.emit('balanceSubtract', {
        //     type: 'add',
        //     guildID: this.guildID,
        //     memberID: this.memberID,
        //     amount: Number(amount),
        //     balance: balance + amount,
        //     reason
        // })

        return amount
    }

    /**
     * Fetches the user's balance.
     * 
     * This method is an alias for 'EconomyUser.balance.fetch()' method
     * @returns {Number} User's balance.
     */
    get() {
        return this.database.fetch(`${this.guildID}.${this.memberID}.money`) || 0
    }

    /**
     * Fetches the user's balance.
     * @returns {Number} User's balance.
     */
    fetch() {
        return this.get()
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
        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        }

        if (typeof senderMemberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.senderMemberID + typeof memberID)
        }

        this.add(amount, recipientMemberID, this.guildID, receivingReason || 'receiving money from user')
        this.subtract(amount, senderMemberID, this.guildID, sendingReason || 'sending money to user')

        return true
    }
}

class Bank extends Base {
    constructor(memberID, guildID, storagePath) {
        super(memberID, guildID)

        this.database = new DatabaseManager({ storagePath })
    }

    /**
     * Sets the money amount on user's bank balance.
     * @param {Number} amount Money amount
     * @param {String} [reason] The reason why you set the money.
     * @returns {Number} Money amount
     */
    set(amount/* , reason */) {
        // const bank = this.get()

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        }

        this.database.set(`${this.guildID}.${this.memberID}.bank`, Number(amount))

        // this.emit('bankSet', {
        //     type: 'set',
        //     guildID: this.guildID,
        //     memberID: this.memberID,
        //     amount: Number(amount),
        //     bank,
        //     reason
        // })

        return amount
    }

    /**
     * Adds the money amount on user's bank balance.
     * @param {Number} amount Money amount.
     * @param {String} [reason] The reason why you add the money.
     * @returns {Number} Money amount.
     */
    add(amount/* , reason */) {
        // const bank = this.get()

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        }

        this.database.add(`${this.guildID}.${this.memberID}.bank`, Number(amount))

        // this.emit('bankAdd', {
        //     type: 'add',
        //     guildID: this.guildID,
        //     memberID: this.memberID,
        //     amount: Number(amount),
        //     bank: bank + amount,
        //     reason
        // })

        return amount
    }

    /**
     * Subtracts the money amount on user's bank balance.
     * @param {Number} amount Money amount.
     * @param {String} [reason] The reason why you subtract the money.
     * @returns {Number} Money amount.
     */
    subtract(amount/* , reason */) {
        const bank = this.get()

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        }

        this.database.subtract(`${this.guildID}.${this.memberID}.bank`, Number(amount))

        // this.emit('bankSubtract', {
        //     type: 'subtract',
        //     guildID: this.guildID,
        //     memberID: this.memberID,
        //     amount: Number(amount),
        //     bank: bank - amount,
        //     reason
        // })

        return amount
    }

    /**
     * Fetches the user's bank balance.
     * @returns {Number} User's bank balance.
     */
    fetch() {
        return this.database.fetch(`${this.guildID}.${this.memberID}.bank`) || 0
    }

    /**
     * Fetches the user's bank balance.
     * 
     * This method is an alias for 'EconomyUser.bank.fetch()' method.
     * @returns {Number} User's bank balance.
     */
    get() {
        return this.fetch()
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
 * @property {String} date Date when the item was bought by a user.
 */

/**
 * History data object.
 * @typedef {Object} HistoryData
 * @property {Number} id Item ID in history.
 * @property {String} itemName Item name.
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
 * Economy user class.
 * @type {EconomyUser}
 */
module.exports = EconomyUser