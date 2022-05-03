const Emitter = require('../util/Emitter')
const EconomyError = require('../util/EconomyError')
const errors = require('../../structures/errors')

const DatabaseManager = require('../../managers/DatabaseManager')


/**
 * User bank class.
 */
class Bank extends Emitter {
    constructor(memberID, guildID, storagePath) {
        super()

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
         * Databaase Manager.
         * @type {DatabaseManager}
         * @private
         */
        this.database = new DatabaseManager({ storagePath })
    }

    /**
     * Sets the money amount on user's bank balance.
     * @param {Number} amount Money amount
     * @param {String} [reason] The reason why you set the money.
     * @returns {Number} Money amount
     */
    set(amount, reason) {
        const bank = this.get()

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        }

        this.database.set(`${this.guildID}.${this.memberID}.bank`, Number(amount))

        this.emit('bankSet', {
            type: 'set',
            guildID: this.guildID,
            memberID: this.memberID,
            amount: Number(amount),
            bank,
            reason
        })

        return amount
    }

    /**
     * Adds the money amount on user's bank balance.
     * @param {Number} amount Money amount.
     * @param {String} [reason] The reason why you add the money.
     * @returns {Number} Money amount.
     */
    add(amount, reason) {
        const bank = this.get()

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        }

        this.database.add(`${this.guildID}.${this.memberID}.bank`, Number(amount))

        this.emit('bankAdd', {
            type: 'add',
            guildID: this.guildID,
            memberID: this.memberID,
            amount: Number(amount),
            bank: bank + amount,
            reason
        })

        return amount
    }

    /**
     * Subtracts the money amount on user's bank balance.
     * @param {Number} amount Money amount.
     * @param {String} [reason] The reason why you subtract the money.
     * @returns {Number} Money amount.
     */
    subtract(amount, reason) {
        const bank = this.get()

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        }

        this.database.subtract(`${this.guildID}.${this.memberID}.bank`, Number(amount))

        this.emit('bankSubtract', {
            type: 'subtract',
            guildID: this.guildID,
            memberID: this.memberID,
            amount: Number(amount),
            bank: bank - amount,
            reason
        })

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
 * @property {Boolean} [debug=false] Enables or disables the debug mode.
 */

/**
 * User bank class.
 * @type {Bank}
 */
module.exports = Bank