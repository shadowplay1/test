const Emitter = require('../classes/util/Emitter')

const EconomyError = require('../classes/util/EconomyError')
const DatabaseManager = require('./DatabaseManager')

const errors = require('../structures/errors')


/**
* Balance manager methods class.
* @extends {Emitter}
*/
class BalanceManager extends Emitter {

    /**
     * Balance Manager.
     * @param {object} options Economy configuration.
     * @param {DatabaseManager} options.database Database manager.
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
    * Fetches the user's balance.
    * @param {string} memberID Member ID
    * @param {string} guildID Guild ID
    * @returns {Promise<number>} User's balance
    */
    async fetch(memberID, guildID) {
        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        const result = await this.database.fetch(`${guildID}.${memberID}.money`)
        return result
    }

    /**
    * Gets the user's balance.
    * 
    * This method is an alias of `BalanceManager.fetch()` method.
    * @param {string} memberID Member ID
    * @param {string} guildID Guild ID
    * @returns {Promise<number>} User's balance
    */
    get(memberID, guildID) {
        return this.fetch(memberID, guildID)
    }

    /**
     * Sets the money amount on user's balance.
     * @param {number} amount Money amount.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @param {string} reason The reason why you set the money.
     * @returns {Promise<number>} Money amount.
     */
    async set(amount, memberID, guildID, reason = null) {
        const balance = await this.fetch(memberID, guildID)

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        }

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        await this.database.set(`${guildID}.${memberID}.money`, amount)

        this.emit('balanceSet', {
            type: 'set',
            guildID,
            memberID,
            amount: Number(amount),
            balance,
            reason
        })

        return amount
    }

    /**
     * Adds the money amount on user's balance.
     * @param {number} amount Money amount.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @param {string} reason The reason why you add the money.
     * @returns {Promise<number>} Money amount.
     */
    async add(amount, memberID, guildID, reason = null) {
        const balance = await this.fetch(memberID, guildID)

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        }

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        await this.database.add(`${guildID}.${memberID}.money`, amount)

        this.emit('balanceAdd', {
            type: 'add',
            guildID,
            memberID,
            amount: Number(amount),
            balance: balance + amount,
            reason
        })

        return amount
    }

    /**
     * Subtracts the money amount on user's balance.
     * @param {number} amount Money amount.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @param {string} reason The reason why you add the money.
     * @returns {Promise<number>} Money amount.
     */
    async subtract(amount, memberID, guildID, reason = null) {
        const balance = await this.fetch(memberID, guildID)

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        }

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        await this.database.subtract(`${guildID}.${memberID}.money`, amount)

        this.emit('balanceSubtract', {
            type: 'subtract',
            guildID,
            memberID,
            amount: Number(amount),
            balance: balance - amount,
            reason
        })

        return amount
    }

    /**
     * Shows a money leaderboard for your server.
     * @param {string} guildID Guild ID.
     * @returns {Promise<BalanceLeaderboard[]>} Sorted leaderboard array.
     */
    async leaderboard(guildID) {
        const lb = []
        const data = await this.database.all()

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)
        }

        const guildData = data[guildID]
        if (!guildData) return []

        const users = Object.keys(guildData).filter(key => key !== 'settings' && key !== 'shop')
        const ranks = Object.values(guildData).map(user => user.money).filter(userID => !isNaN(userID))

        for (const rank in ranks) lb.push({
            index: Number(rank) + 1,
            userID: users[rank],
            money: Number(ranks[rank])
        })

        return lb.sort((a, b) => b.money - a.money)
    }

    /**
     * Sends the money to a specified user.
     * @param {string} guildID Guild ID.
     * @param {TransferingOptions} options Transfering options.
     * @returns {Promise<number>} Amount of money that was sent.
     */
    async transfer(guildID, options) {
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

        await this.add(amount, recipientMemberID, guildID, receivingReason || 'receiving money from user')
        await this.subtract(amount, senderMemberID, guildID, sendingReason || 'sending money to user')

        return amount
    }
}


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
 * Balance leaderboard object.
 * @typedef {object} BalanceLeaderboard
 * @property {number} index User's place in the leaderboard.
 * @property {string} userID User ID.
 * @property {number} money Amount of money.
 */


/**
 * Balance manager class.
 * @type {BalanceManager}
 */
module.exports = BalanceManager
