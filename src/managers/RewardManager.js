const ms = require('../structures/ms')

const EconomyError = require('../classes/util/EconomyError')

const BalanceManager = require('./BalanceManager')
const CooldownManager = require('./CooldownManager')

const DatabaseManager = require('./DatabaseManager')

const errors = require('../structures/errors')
const UtilsManager = require('./UtilsManager')

const parse = ms => ({
    days: Math.floor(ms / 86400000),
    hours: Math.floor(ms / 3600000 % 24),
    minutes: Math.floor(ms / 60000 % 60),
    seconds: Math.floor(ms / 1000 % 60),
    milliseconds: Math.floor(ms % 1000)
})

/**
* Reward manager methods class.
*/
class RewardManager {

    /**
      * Reward Manager.
      * @param {Object} options Economy configuration.
      * @param {String} options.storagePath Full path to a JSON file. Default: './storage.json'.
      * @param {Number} options.dailyCooldown Cooldown for Daily Command (in ms). Default: 24 hours (60000 * 60 * 24 ms)
      * @param {Number} options.workCooldown Cooldown for Work Command (in ms). Default: 1 hour (60000 * 60 ms)
      * @param {Number} options.dailyAmount Amount of money for Daily Command. Default: 100.
      * @param {Number} options.weeklyCooldown
      * Cooldown for Weekly Command (in ms). Default: 7 days (60000 * 60 * 24 * 7 ms)
      * @param {Number} options.weeklyAmount Amount of money for Weekly Command. Default: 1000.
      * @param {Number | Array} options.workAmount Amount of money for Work Command. Default: [10, 50].
     */
    constructor(options) {

        /**
         * Economy configuration.
         * @type {EconomyOptions}
         * @private
         */
        this.options = options

        /**
         * Utils manager methods object.
         * @type {UtilsManager}
         * @private
         */
        this.utils = new UtilsManager(options)

        /**
        * Database manager methods object.
        * @type {DatabaseManager}
        * @private
        */
        this.database = new DatabaseManager(options)

        /**
         * Cooldown manager methods object.
         * @type {CooldownManager}
         * @private
         */
        this.cooldowns = new CooldownManager(options)

        /**
         * Balance manager methods object.
         * @type {BalanceManager}
         * @private
         */
        this.balance = new BalanceManager(options)
    }

    /**
     * Adds a daily reward on user's balance.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @param {String} reason The reason why the money was added. Default: 'claimed the daily reward'.
     * @returns {RewardData} Daily reward object.
    */
    daily(memberID, guildID, reason = 'claimed the daily reward') {
        if (typeof memberID !== 'string') throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        if (typeof guildID !== 'string') throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)

        const cooldown = this.database.get(`${guildID}.settings.dailyCooldown`)
            || this.options.dailyCooldown

        const defaultDailyReward = this.database.get(`${guildID}.settings.dailyCooldown`)
            || this.options.dailyAmount

        let reward

        if (Array.isArray(defaultDailyReward)) {
            const min = defaultDailyReward[0]
            const max = defaultDailyReward[1]

            if (defaultDailyReward.length == 1) reward = defaultDailyReward[0]
            else reward = Math.floor(Math.random() * (Number(min) - Number(max)) + Number(max))
        }

        else reward = defaultDailyReward

        const userCooldown = this.cooldowns.daily(memberID, guildID)
        const cooldownEnd = cooldown - (Date.now() - userCooldown)

        if (userCooldown !== null && cooldownEnd > 0) {
            return {
                type: 'daily',
                status: false,
                cooldown: {
                    time: parse(cooldownEnd),
                    pretty: ms(cooldownEnd)
                },

                reward: null,
                defaultReward: defaultDailyReward
            }
        }

        this.balance.add(reward, memberID, guildID, reason)
        this.database.set(`${guildID}.${memberID}.dailyCooldown`, Date.now())

        return {
            type: 'daily',
            status: true,
            cooldown: null,
            reward,
            defaultReward: defaultDailyReward
        }
    }

    /**
     * Adds a work reward on user's balance.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @param {String} reason The reason why the money was added. Default: 'claimed the work reward'.
     * @returns {RewardData} Work reward object.
     */
    work(memberID, guildID, reason = 'claimed the work reward') {
        if (typeof memberID !== 'string') throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        if (typeof guildID !== 'string') throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)

        const cooldown = this.database.get(`${guildID}.settings.workCooldown`)
            || this.options.workCooldown

        const defaultWorkReward = this.database.get(`${guildID}.settings.workAmount`)
            || this.options.workAmount

        let reward

        if (Array.isArray(defaultWorkReward)) {
            const min = defaultWorkReward[0]
            const max = defaultWorkReward[1]

            if (defaultWorkReward.length == 1) reward = defaultWorkReward[0]
            else reward = Math.floor(Math.random() * (Number(min) - Number(max)) + Number(max))
        }

        else reward = defaultWorkReward

        const userCooldown = this.cooldowns.work(memberID, guildID)
        const cooldownEnd = cooldown - (Date.now() - userCooldown)

        if (userCooldown !== null && cooldownEnd > 0) {
            return {
                type: 'work',
                status: false,
                cooldown: {
                    time: parse(cooldownEnd),
                    pretty: ms(cooldownEnd),
                },

                reward: null,
                defaultReward: defaultWorkReward
            }
        }

        this.balance.add(reward, memberID, guildID, reason)
        this.database.set(`${guildID}.${memberID}.workCooldown`, Date.now())

        return {
            type: 'work',
            status: true,
            cooldown: null,
            reward,
            defaultReward: defaultWorkReward
        }
    }

    /**
     * Adds a weekly reward on user's balance.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @param {String} reason The reason why the money was added. Default: 'claimed the weekly reward'.
     * @returns {RewardData} Weekly reward object.
     */
    weekly(memberID, guildID, reason = 'claimed the weekly reward') {
        if (typeof memberID !== 'string') throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        if (typeof guildID !== 'string') throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)

        const cooldown = this.database.get(`${guildID}.settings.weeklyCooldown`)
            || this.options.weeklyCooldown

        const defaultWeeklyReward = this.database.get(`${guildID}.settings.weeklyAmount`)
            || this.options.weeklyAmount

        let reward

        if (Array.isArray(defaultWeeklyReward)) {
            const min = defaultWeeklyReward[0]
            const max = defaultWeeklyReward[1]

            if (defaultWeeklyReward.length == 1) reward = defaultWeeklyReward[0]
            else reward = Math.floor(Math.random() * (Number(min) - Number(max)) + Number(max))
        }

        else reward = defaultWeeklyReward

        const userCooldown = this.cooldowns.weekly(memberID, guildID)
        const cooldownEnd = cooldown - (Date.now() - userCooldown)

        if (userCooldown !== null && cooldownEnd > 0) {
            return {
                type: 'weekly',
                status: false,
                cooldown: {
                    time: parse(cooldownEnd),
                    pretty: ms(cooldownEnd),
                },

                reward: null,
                defaultReward: defaultWeeklyReward
            }
        }

        this.balance.add(reward, memberID, guildID, reason)
        this.database.set(`${guildID}.${memberID}.weeklyCooldown`, Date.now())

        return {
            type: 'weekly',
            status: true,
            cooldown: null,
            reward,
            defaultReward: defaultWeeklyReward
        }
    }
}

/**
 * @typedef {Object} RewardData
 * @property {'daily' | 'work' | 'weekly'} type Type of the operation.
 * @property {Boolean} status The status of operation.
 * @property {CooldownData} cooldown Cooldown object.
 * @property {Number} reward Amount of money that the user received.
 * @property {Number} defaultReward Reward that was specified in a module configuration.
 */

/**
 * @typedef {Object} TimeData
 * @property {Number} days Amount of days until the cooldown ends.
 * @property {Number} hours Amount of hours until the cooldown ends.
 * @property {Number} minutes Amount of minutes until the cooldown ends.
 * @property {Number} seconds Amount of seconds until the cooldown ends.
 * @property {Number} milliseconds Amount of milliseconds until the cooldown ends.
 */

/**
 * @typedef {Object} CooldownData
 * @property {TimeData} time A time object with the remaining time until the cooldown ends.
 * @property {String} pretty A formatted string with the remaining time until the cooldown ends.
 */

/**
 * Reward manager class.
 * @type {RewardManager}
 */
module.exports = RewardManager
