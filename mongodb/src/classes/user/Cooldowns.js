const DatabaseManager = require('../../managers/DatabaseManager')
const ms = require('../../structures/ms')

const parse = ms => ({
    days: Math.floor(ms / 86400000),
    hours: Math.floor(ms / 3600000 % 24),
    minutes: Math.floor(ms / 60000 % 60),
    seconds: Math.floor(ms / 1000 % 60),
    milliseconds: Math.floor(ms % 1000)
})


class Cooldowns {

    /**
     * Cooldowns class.
     * @param {RawEconomyUser} userObject User object from database.
     * @param {EconomyConfiguration} options Economy configuration.
     * @param {DatabaseManager} database Database Manager.
     */
    constructor(userObject, options, database) {

        /**
         * Economy configuration.
         * @type {EconomyConfiguration}
         */
        this.options = options

        /**
         * Cooldowns object.
         * @type {CooldownsObject}
         * @private
         */
        this._cooldowns = {
            daily: userObject.dailyCooldown,
            work: userObject.workCooldown,
            weekly: userObject.weeklyCooldown
        }

        /**
         * Cooldowns configuration object.
         * @type {RewardCooldowns}
         */
        this._rewardCooldowns = {}

        /**
         * Database Manager.
         * @type {DatabaseManager}
         */
        this._database = database

        database.get(`${userObject.guildID}.settings`).then(settings => {
            this._rewardCooldowns.daily = settings?.dailyCooldown || options.dailyCooldown
            this._rewardCooldowns.work = settings?.workCooldown || options.workCooldown
            this._rewardCooldowns.weekly = settings?.weeklyCooldown || options.weeklyCooldown
        })
    }

    /**
     * Returns the cooldown of the specified type.
     * @param {'daily' | 'work' | 'weekly'} type Cooldown type.
     * @returns {Promise<CooldownData>} Cooldown object.
     */
    getCooldown(type) {
        const allCooldowns = this.getAll()
        return allCooldowns[type]
    }

    /**
     * Gets a user's daily cooldown.
     * @returns {Promise<CooldownData>} User's daily cooldown.
     */
    getDaily() {
        const allCooldowns = this.getAll()
        return allCooldowns.daily
    }

    /**
     * Gets a user's work cooldown.
     * @returns {Promise<CooldownData>} User's work cooldown.
     */
    getWork() {
        const allCooldowns = this.getAll()
        return allCooldowns.work
    }

    /**
     * Gets a user's weekly cooldown.
     * @returns {Promise<CooldownData>} User's weekly cooldown.
     */
    getWeekly() {
        const allCooldowns = this.getAll()
        return allCooldowns.weekly
    }

    /**
     * Gets all user's cooldowns
     * @returns {Promise<CooldownsTimeObject>} User's cooldowns object.
     */
    getAll() {
        const result = {}
        const rawCooldownsObject = this._cooldowns

        for (const [rewardType, userCooldown] of Object.entries(rawCooldownsObject)) {
            const rewardCooldown = this._rewardCooldowns[rewardType]
            const cooldownEnd = rewardCooldown - (Date.now() - userCooldown)

            const cooldownObject = userCooldown ? {
                time: parse(cooldownEnd),
                pretty: ms(cooldownEnd)
            } : null

            result[rewardType] = cooldownObject
        }

        return result
    }

    /**
      * Clears user's daily cooldown.
      * @returns {Promise<boolean>} If cleared: true; else: false
      */
    async clearDaily() {
        const result = await this.database.delete(`${guildID}.${memberID}.dailyCooldown`)

        this.cache.updateMany(['cooldowns', 'users'], {
            memberID,
            guildID
        })

        return result
    }

    /**
     * Clears user's work cooldown.
     * @returns {Promise<boolean>} If cleared: true; else: false
     */
    async clearWork() {
        const result = await this.database.delete(`${guildID}.${memberID}.workCooldown`)

        this.cache.updateMany(['cooldowns', 'users'], {
            memberID,
            guildID
        })

        return result
    }

    /**
     * Clears user's weekly cooldown.
     * @returns {Promise<boolean>} If cleared: true; else: false
     */
    async clearWeekly() {
        const result = await this.database.delete(`${guildID}.${memberID}.weeklyCooldown`)

        this.cache.updateMany(['cooldowns', 'users'], {
            memberID,
            guildID
        })

        return result
    }
}

/**
 * Cooldowns class.
 * @type {Cooldowns}
 */
module.exports = Cooldowns

/**
 * @typedef {object} RewardCooldowns
 * @property {number} daily Daily cooldown.
 * @property {number} work Work cooldown.
 * @property {number} weekly Weekly cooldown.
 */

/**
 * @typedef {object} RawEconomyUser Raw economy user object from database.
 * @property {number} dailyCooldown User's daily cooldown.
 * @property {number} workCooldown User's work cooldown.
 * @property {number} weeklyCooldown User's weekly cooldown.
 * @property {number} money User's balance.
 * @property {number} bank User's bank balance.
 * @property {InventoryData} inventory User's inventory.
 * @property {HistoryData} history User's purchases history.
 * @property {string} id User ID.
 * @property {string} guildID Guild ID.
 */

/**
 * @typedef {object} EconomyConfiguration Default Economy configuration.
 * @property {string} [storagePath='./storage.json'] Full path to a JSON file. Default: './storage.json'
 * @property {boolean} [checkStorage=true] Checks the if database file exists and if it has errors. Default: true
 * @property {number} [dailyCooldown=86400000] 
 * Cooldown for Daily Command (in ms). Default: 24 hours (60000 * 60 * 24 ms)
 * 
 * @property {number} [workCooldown=3600000] Cooldown for Work Command (in ms). Default: 1 hour (60000 * 60 ms)
 * @property {number | number[]} [dailyAmount=100] Amount of money for Daily Command. Default: 100.
 * @property {number} [weeklyCooldown=604800000] 
 * Cooldown for Weekly Command (in ms). Default: 7 days (60000 * 60 * 24 * 7 ms)
 * 
 * @property {number | number[]} [weeklyAmount=100] Amount of money for Weekly Command. Default: 1000.
 * @property {number | number[]} [workAmount=[10, 50]] Amount of money for Work Command. Default: [10, 50].
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
 * @property {ErrorHandlerConfiguration} [errorHandler=ErrorHandlerConfiguration] Error handler configuration.

 * @property {CheckerConfiguration} [optionsChecker=CheckerConfiguration] 
 * Configuration for an 'Economy.utils.checkOptions' method.
 * @property {boolean} [debug=false] Enables or disables the debug mode.
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
 * @typedef {object} CooldownsObject
 * @property {number} daily Cooldown for Daily Command.
 * @property {number} work Cooldown for Work Command.
 * @property {number} weekly Cooldown for Weekly Command.
 */

/**
 * @typedef {object} CooldownsTimeObject
 * @property {CooldownData} daily Cooldown for Daily Command.
 * @property {CooldownData} work Cooldown for Work Command.
 * @property {CooldownData} weekly Cooldown for Weekly Command.
 */
