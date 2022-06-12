const Emitter = require('../util/Emitter')
const EconomyError = require('../util/EconomyError')
const errors = require('../../structures/errors')

const DatabaseManager = require('../../managers/DatabaseManager')


/**
 * User balance class.
 * @extends {Emitter}
 */
class Balance extends Emitter {

    /**
     * User balance class.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @param {EconomyOptions} ecoOptions Economy configuration.
     */
    constructor(memberID, guildID, ecoOptions) {
        super()

        /**
        * Member ID.
        * @type {string}
        */
        this.memberID = memberID

        /**
         * Guild ID.
         * @type {string}
         */
        this.guildID = guildID

        /**
         * Databaase Manager.
         * @type {DatabaseManager}
         * @private
         */
        this.database = new DatabaseManager(ecoOptions)
    }

    /**
     * Sets the money amount on user's balance.
     * @param {number} amount Money amount
     * @param {string} [reason] The reason why you set the money.
     * @returns {number} Money amount
     */
    set(amount, reason) {
        const balance = this.get()

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        }

        this.database.set(`${this.guildID}.${this.memberID}.money`, amount)

        this.emit('balanceSet', {
            type: 'set',
            guildID: this.guildID,
            memberID: this.memberID,
            amount: Number(amount),
            balance,
            reason
        })

        return amount
    }

    /**
     * Adds the money amount on user's balance.
     * @param {number} amount Money amount.
     * @param {string} [reason] The reason why you add the money.
     * @returns {number} Money amount.
     */
    add(amount, reason) {
        const balance = this.get()

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        }

        this.database.add(`${this.guildID}.${this.memberID}.money`, amount)

        this.emit('balanceAdd', {
            type: 'add',
            guildID: this.guildID,
            memberID: this.memberID,
            amount: Number(amount),
            balance: balance + amount,
            reason
        })

        return amount
    }

    /**
     * Subtracts the money amount on user's balance.
     * @param {number} amount Money amount.
     * @param {string} [reason] The reason why you subtract the money.
     * @returns {number} Money amount.
     */
    subtract(amount, reason) {
        const balance = this.get()

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        }

        this.database.subtract(`${this.guildID}.${this.memberID}.money`, amount)

        this.emit('balanceSubtract', {
            type: 'add',
            guildID: this.guildID,
            memberID: this.memberID,
            amount: Number(amount),
            balance: balance + amount,
            reason
        })

        return amount
    }

    /**
     * Fetches the user's balance.
     * 
     * This method is an alias for 'EconomyUser.balance.fetch()' method
     * @returns {number} User's balance.
     */
    get() {
        return this.database.fetch(`${this.guildID}.${this.memberID}.money`) || 0
    }

    /**
     * Fetches the user's balance.
     * @returns {number} User's balance.
     */
    fetch() {
        return this.get()
    }

    /**
     * Sends the money to a specified user.
     * @param {TransferingOptions} options Transfering options.
     * @returns {number} Amount of money that was sent.
     */
    transfer(options) {
        const {
            amount, senderMemberID,
            recipientMemberID,
            sendingReason, receivingReason
        } = options || {}

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        }

        if (typeof senderMemberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.senderMemberID + typeof memberID)
        }

        if (typeof recipientMemberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.recipientMemberID + typeof memberID)
        }

        this.add(amount, recipientMemberID, this.guildID, receivingReason || 'receiving money from user')
        this.subtract(amount, senderMemberID, this.guildID, sendingReason || 'sending money to user')

        return true
    }
}

/**
 * @typedef {object} EconomyOptions Default Economy configuration.
 * @property {string} [storagePath='./storage.json'] Full path to a JSON file. Default: './storage.json'
 * @property {boolean} [checkStorage=true] Checks the if database file exists and if it has errors. Default: true
 * @property {number} [dailyCooldown=86400000] 
 * Cooldown for Daily Command (in ms). Default: 24 hours (60000 * 60 * 24 ms)
 * 
 * @property {number} [workCooldown=3600000] Cooldown for Work Command (in ms). Default: 1 hour (60000 * 60 ms)
 * @property {Number | Number[]} [dailyAmount=100] Amount of money for Daily Command. Default: 100.
 * @property {number} [weeklyCooldown=604800000] 
 * Cooldown for Weekly Command (in ms). Default: 7 days (60000 * 60 * 24 * 7 ms)
 * 
 * @property {Number | Number[]} [weeklyAmount=100] Amount of money for Weekly Command. Default: 1000.
 * @property {Number | Number[]} [workAmount=[10, 50]] Amount of money for Work Command. Default: [10, 50].
 * @property {boolean} [subtractOnBuy=true] 
 * If true, when someone buys the item, their balance will subtract by item price. Default: false
 * 
 * @property {number} [sellingItemPercent=75] 
 * Percent of the item's price it will be sold for. Default: 75.
 * 
 * @property {boolean} [deprecationWarnings=true] 
 * If true, the deprecation warnings will be sent in the console. Default: true.
 * 
 * @property {boolean} [savePurchasesHistory=true] If true, the module will save all the purchases history.
 * 
 * @property {number} [updateCountdown=1000] Checks for if storage file exists in specified time (in ms). Default: 1000.
 * @property {string} [dateLocale='en'] The region (example: 'ru'; 'en') to format the date and time. Default: 'en'.
 * @property {UpdaterOptions} [updater=UpdaterOptions] Update checker configuration.
 * @property {ErrorHandlerOptions} [errorHandler=ErrorHandlerOptions] Error handler configuration.
 * @property {CheckerOptions} [optionsChecker=CheckerOptions] Configuration for an 'Economy.utils.checkOptions' method.
 * @property {boolean} [debug=false] Enables or disables the debug mode.
 */

/**
 * Transfering options.
 * @typedef {object} TransferingOptions
 * @property {number} amount Amount of money to send.
 * @property {string} senderMemberID A member ID who will send the money.
 * @property {string} recipientMemberID A member ID who will receive the money.
 * @property {string} [sendingReason='sending money to user'] 
 * The reason of subtracting the money from sender. (example: "sending money to {user}")
 * @property {string} [receivingReason='receiving money from user']
 * The reason of adding a money to recipient. (example: "receiving money from {user}")
 */

/**
 * User balance class.
 * @type {Balance}
 */
module.exports = Balance