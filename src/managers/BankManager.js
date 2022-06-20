const Emitter = require('../classes/util/Emitter')

const EconomyError = require('../classes/util/EconomyError')
const errors = require('../structures/errors')

const DatabaseManager = require('./DatabaseManager')


/**
* Bank manager methods class.
* @extends {Emitter}
*/
class BankManager extends Emitter {

    /**
     * Bank Manager.
     * @param {object} options Economy configuration.
     * @param {DatabaseManager} database Database manager.
     */
    constructor(options = {}, database) {
        super(options)


        /**
         * Economy configuration.
         * @type {EconomyOptions}
         * @private
         */
        this.options = options

        /**
         * Fetch manager methods object.
         * @type {DatabaseManager}
         * @private
         */
        this.database = database
    }

    /**
    * Fetches the user's bank balance.
    * @param {string} memberID Member ID
    * @param {string} guildID Guild ID
    * @returns {Promise<number>} User's bank balance
    */
    async fetch(memberID, guildID) {
        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        const result = await this.database.fetch(`${guildID}.${memberID}.bank`)
        return result
    }

    /**
    * Gets the user's bank balance.
    * 
    * This method is an alias of `BankManager.fetch()` method.
    * @param {string} memberID Member ID
    * @param {string} guildID Guild ID
    * @returns {Promise<number>} User's bank balance
    */
    get(memberID, guildID) {
        return this.fetch(memberID, guildID)
    }

    /**
     * Sets the money amount on user's bank balance.
     * @param {number} amount Money amount.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @param {string} reason The reason why you add the money.
     * @returns {Promise<number>} Money amount.
     */
    async set(amount, memberID, guildID, reason = null) {
        const bank = await this.fetch(memberID, guildID)

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        }

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        await this.database.set(`${guildID}.${memberID}.bank`, Number(amount))

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
     * @param {number} amount Money amount.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @param {string} reason The reason why you add the money.
     * @returns {Promise<number>} Money amount.
     */
    async add(amount, memberID, guildID, reason = null) {
        const bank = this.fetch(memberID, guildID)

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        }

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        await this.database.add(`${guildID}.${memberID}.bank`, Number(amount))

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
     * @param {number} amount Money amount.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @param {string} reason The reason why you add the money.
     * @returns {Promise<number>} Money amount.
     */
    async subtract(amount, memberID, guildID, reason = null) {
        const bank = await this.fetch(memberID, guildID)

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        }

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        await this.database.subtract(`${guildID}.${memberID}.bank`, Number(amount))

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
     * Shows a money leaderboard for your server.
     * @param {string} guildID Guild ID.
     * @returns {Promise<BankLeaderboard[]>} Sorted leaderboard array.
     */
    async leaderboard(guildID) {
        const lb = []
        const data = this.database.all()

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
 * @typedef {object} BankLeaderboard
 * @property {number} index User's place in the top.
 * @property {string} userID User ID.
 * @property {number} money Amount of money.
 */

/**
 * Bank manager class.
 * @type {BankManager}
 */
module.exports = BankManager
