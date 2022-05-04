const Emitter = require('../classes/util/Emitter')
const EconomyError = require('../classes/util/EconomyError')

const FetchManager = require('./FetchManager')
const DatabaseManager = require('./DatabaseManager')

const errors = require('../structures/errors')

/**
* Bank manager methods class.
* @extends {Emitter}
*/
class BankManager extends Emitter {

    /**
     * Bank Manager.
     * 
     * @param {Object} options Economy configuration.
     * @param {String} options.storagePath Full path to a JSON file. Default: './storage.json'.
     */
    constructor(options = {}) {
        super(options)


        /**
         * Economy configuration.
         * @type {EconomyOptions}
         * @private
         */
        this.options = options

        /**
         * Fetch manager methods object.
         * @type {FetchManager}
         * @private
         */
        this.fetcher = new FetchManager(options)

        /**
         * Fetch manager methods object.
         * @type {DatabaseManager}
         * @private
         */
        this.database = new DatabaseManager(options)
    }

    /**
    * Fetches the user's bank balance.
    * @param {String} memberID Member ID
    * @param {String} guildID Guild ID
    * @returns {Number} User's bank balance
    */
    fetch(memberID, guildID) {
        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        return this.fetcher.fetchBank(memberID, guildID)
    }

    /**
     * Sets the money amount on user's bank balance.
     * @param {Number} amount Money amount.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @param {String} reason The reason why you add the money.
     * @returns {Number} Money amount.
     */
    set(amount, memberID, guildID, reason = null) {
        const bank = this.fetcher.fetchBank(memberID, guildID)

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        }

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        this.database.set(`${guildID}.${memberID}.bank`, Number(amount))

        this.emit('bankSet', {
            type: 'set',
            guildID,
            memberID,
            amount: Number(amount),
            bank,
            reason
        })

        return amount
    }

    /**
     * Adds the money amount on user's bank balance.
     * @param {Number} amount Money amount.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @param {String} reason The reason why you add the money.
     * @returns {Number} Money amount.
     */
    add(amount, memberID, guildID, reason = null) {
        const bank = this.fetcher.fetchBank(memberID, guildID)

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        }

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        this.database.add(`${guildID}.${memberID}.bank`, Number(amount))

        this.emit('bankAdd', {
            type: 'add',
            guildID,
            memberID,
            amount: Number(amount),
            bank: bank + amount,
            reason
        })

        return amount
    }

    /**
     * Subtracts the money amount on user's bank balance.
     * @param {Number} amount Money amount.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @param {String} reason The reason why you add the money.
     * @returns {Number} Money amount.
     */
    subtract(amount, memberID, guildID, reason = null) {
        const bank = this.fetcher.fetchBank(memberID, guildID)

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        }

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        this.database.subtract(`${guildID}.${memberID}.bank`, Number(amount))

        this.emit('bankSubtract', {
            type: 'subtract',
            guildID,
            memberID,
            amount: Number(amount),
            bank: bank + amount,
            reason
        })

        return amount
    }

    /**
     * Shows a money leaderboard for your server
     * @param {String} guildID Guild ID
     * @returns {BankLeaderboard[]} Sorted leaderboard array
     */
    leaderboard(guildID) {
        const lb = []
        const data = this.fetcher.fetchAll()

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        const guildData = data[guildID]
        if (!guildData) return []

        const users = Object.keys(guildData)
        const ranks = Object.values(guildData).map(user => user.bank).filter(userID => !isNaN(userID))

        for (const rank in ranks) lb.push({
            index: Number(rank) + 1,
            userID: users[rank],
            money: Number(ranks[rank])
        })

        return lb.sort((a, b) => b.money - a.money)
    }
}

/**
 * Bank leaderboard object.
 * @typedef {Object} BankLeaderboard
 * @property {Number} index User's place in the top.
 * @property {String} userID User's ID.
 * @property {Number} money User's amount of money.
 */

/**
 * Bank manager class.
 * @type {BankManager}
 */
module.exports = BankManager