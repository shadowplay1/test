const ms = require('../structures/ms')

const EconomyError = require('../classes/util/EconomyError')

const BalanceManager = require('./BalanceManager')
const CooldownManager = require('./CooldownManager')

const DatabaseManager = require('./DatabaseManager')

const errors = require('../structures/errors')

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
      * @param {object} options Economy configuration.
      * @param {DatabaseManager} database Database manager.
     */
    constructor(options, database) {

        /**
         * Economy configuration.
         * @type {EconomyOptions}
         * @private
         */
        this.options = options

        /**
        * Database manager methods object.
        * @type {DatabaseManager}
        * @private
        */
        this.database = database

        /**
         * Cooldown manager methods object.
         * @type {CooldownManager}
         * @private
         */
        this.cooldowns = new CooldownManager(options, database)

        /**
         * Balance manager methods object.
         * @type {BalanceManager}
         * @private
         */
        this.balance = new BalanceManager(options, database)
    }

    /**
     * Adds a daily reward on user's balance.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @param {string} reason The reason why the money was added. Default: 'claimed the daily reward'.
     * @returns {Promise<RewardData>} Daily reward object.
    */
    async getDaily(memberID, guildID, reason = 'claimed the daily reward') {
        if (typeof memberID !== 'string') throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        if (typeof guildID !== 'string') throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)

        const cooldown = await this.database.get(`${guildID}.settings.dailyCooldown`)
            || this.options.dailyCooldown

        const defaultDailyReward = await this.database.get(`${guildID}.settings.dailyCooldown`)
            || this.options.dailyAmount

        let reward

        if (Array.isArray(defaultDailyReward)) {
            const min = defaultDailyReward[0]
            const max = defaultDailyReward[1]

            if (defaultDailyReward.length == 1) reward = defaultDailyReward[0]
            else reward = Math.floor(Math.random() * (Number(min) - Number(max)) + Number(max))
        }

        else reward = defaultDailyReward

        const userCooldown = await this.cooldowns.getDaily(memberID, guildID)
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

        await this.balance.add(reward, memberID, guildID, reason)
        await this.database.set(`${guildID}.${memberID}.dailyCooldown`, Date.now())

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
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @param {string} reason The reason why the money was added. Default: 'claimed the work reward'.
     * @returns {Promise<RewardData>} Work reward object.
     */
    async getWork(memberID, guildID, reason = 'claimed the work reward') {
        if (typeof memberID !== 'string') throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        if (typeof guildID !== 'string') throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)

        const cooldown = await this.database.get(`${guildID}.settings.workCooldown`)
            || this.options.workCooldown

        const defaultWorkReward = await this.database.get(`${guildID}.settings.workAmount`)
            || this.options.workAmount

        let reward

        if (Array.isArray(defaultWorkReward)) {
            const min = defaultWorkReward[0]
            const max = defaultWorkReward[1]

            if (defaultWorkReward.length == 1) reward = defaultWorkReward[0]
            else reward = Math.floor(Math.random() * (Number(min) - Number(max)) + Number(max))
        }

        else reward = defaultWorkReward

        const userCooldown = await this.cooldowns.getWork(memberID, guildID)
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

        await this.balance.add(reward, memberID, guildID, reason)
        await this.database.set(`${guildID}.${memberID}.workCooldown`, Date.now())

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
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @param {string} reason The reason why the money was added. Default: 'claimed the weekly reward'.
     * @returns {Promise<RewardData>} Weekly reward object.
     */
    async getWeekly(memberID, guildID, reason = 'claimed the weekly reward') {
        if (typeof memberID !== 'string') throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        if (typeof guildID !== 'string') throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)

        const cooldown = await this.database.get(`${guildID}.settings.weeklyCooldown`)
            || this.options.weeklyCooldown

        const defaultWeeklyReward = await this.database.get(`${guildID}.settings.weeklyAmount`)
            || this.options.weeklyAmount

        let reward

        if (Array.isArray(defaultWeeklyReward)) {
            const min = defaultWeeklyReward[0]
            const max = defaultWeeklyReward[1]

            if (defaultWeeklyReward.length == 1) reward = defaultWeeklyReward[0]
            else reward = Math.floor(Math.random() * (Number(min) - Number(max)) + Number(max))
        }

        else reward = defaultWeeklyReward

        const userCooldown = await this.cooldowns.getWeekly(memberID, guildID)
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

        await this.balance.add(reward, memberID, guildID, reason)
        await this.database.set(`${guildID}.${memberID}.weeklyCooldown`, Date.now())

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
 * @typedef {object} RewardData
 * @property {'daily' | 'work' | 'weekly'} type Type of the operation.
 * @property {boolean} status The status of operation.
 * @property {CooldownData} cooldown Cooldown object.
 * @property {number} reward Amount of money that the user received.
 * @property {number} defaultReward Reward that was specified in a module configuration.
 */

/**
 * @typedef {object} TimeData
 * @property {number} days Amount of days until the cooldown ends.
 * @property {number} hours Amount of hours until the cooldown ends.
 * @property {number} minutes Amount of minutes until the cooldown ends.
 * @property {number} seconds Amount of seconds until the cooldown ends.
 * @property {number} milliseconds Amount of milliseconds until the cooldown ends.
 */

/**
 * @typedef {object} CooldownData
 * @property {TimeData} time A time object with the remaining time until the cooldown ends.
 * @property {string} pretty A formatted string with the remaining time until the cooldown ends.
 */

/**
 * Reward manager class.
 * @type {RewardManager}
 */
module.exports = RewardManager
