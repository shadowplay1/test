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
     * @param {EconomyOptions} options Economy configuration.
     */
    constructor(userObject, options) {

        /**
         * Economy configuration.
         * @type {EconomyOptions}
         */
        this.options = options

        /**
         * Database Manager.
         * @type {DatabaseManager}
         * @private
         */
        this._database = new DatabaseManager(options)

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
         * Raw user object.
         * @type {RawEconomyUser}
         * @private
         */
        this._rawUser = userObject

        /**
         * Cooldowns configuration object.
         * @type {Cooldown}
         */
        this._rewardCooldowns = {
            daily: this._database.get(`${this._rawUser.guildID}.settings.dailyCooldown`)
                || this.options.dailyCooldown,

            work: this._database.get(`${this._rawUser.guildID}.settings.workCooldown`)
                || this.options.workCooldown,

            weekly: this._database.get(`${this._rawUser.guildID}.settings.weeklyCooldown`)
                || this.options.weeklyCooldown
        }
    }

    /**
     * Returns the cooldown of the specified type.
     * @param {'daily' | 'work' | 'weekly'} type Cooldown type.
     * @returns {CooldownData} Cooldown object.
     */
    getCooldown(type) {
        const allCooldowns = this.getAll()

        return allCooldowns[type]
    }

    /**
     * Gets a user's daily cooldown.
     * @returns {CooldownData} User's daily cooldown.
     */
    getDaily() {
        const allCooldowns = this.getAll()

        return allCooldowns.daily
    }

    /**
     * Gets a user's work cooldown.
     * @returns {CooldownData} User's work cooldown.
     */
    getWork() {
        const allCooldowns = this.getAll()

        return allCooldowns.work
    }

    /**
     * Gets a user's weekly cooldown.
     * @returns {CooldownData} User's weekly cooldown.
     */
    getWeekly() {
        const allCooldowns = this.getAll()

        return allCooldowns.weekly
    }

    /**
     * Gets all user's cooldowns
     * @returns {CooldownsTimeObject} User's cooldowns object.
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
}

/**
 * Cooldowns class.
 * @type {Cooldowns}
 */
module.exports = Cooldowns


/**
 * @typedef {Object} RawEconomyUser Raw economy user object from database.
 * @property {number} dailyCooldown User's daily cooldown.
 * @property {number} workCooldown User's work cooldown.
 * @property {number} weeklyCooldown User's weekly cooldown.
 * @property {number} money User's balance.
 * @property {number} bank User's bank balance.
 * @property {InventoryData} inventory User's inventory.
 * @property {HistoryData} history User's purchases history.
 * @property {string} id User's ID.
 * @property {string} guildID Guild ID.
 */

/**
 * @typedef {Object} EconomyOptions Default Economy configuration.
 * @property {String} [storagePath='./storage.json'] Full path to a JSON file. Default: './storage.json'
 * @property {Boolean} [checkStorage=true] Checks the if database file exists and if it has errors. Default: true
 * @property {Number} [dailyCooldown=86400000] 
 * Cooldown for Daily Command (in ms). Default: 24 hours (60000 * 60 * 24 ms)
 * 
 * @property {Number} [workCooldown=3600000] Cooldown for Work Command (in ms). Default: 1 hour (60000 * 60 ms)
 * @property {Number | Number[]} [dailyAmount=100] Amount of money for Daily Command. Default: 100.
 * @property {Number} [weeklyCooldown=604800000] 
 * Cooldown for Weekly Command (in ms). Default: 7 days (60000 * 60 * 24 * 7 ms)
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
 * @property {UpdaterOptions} [updater=UpdaterOptions] Update checker configuration.
 * @property {ErrorHandlerOptions} [errorHandler=ErrorHandlerOptions] Error handler configuration.
 * @property {CheckerOptions} [optionsChecker=CheckerOptions] Configuration for an 'Economy.utils.checkOptions' method.
 * @property {Boolean} [debug=false] Enables or disables the debug mode.
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
 * @typedef {Object} CooldownsObject
 * @property {Number} daily Cooldown for Daily Command.
 * @property {Number} work Cooldown for Work Command.
 * @property {Number} weekly Cooldown for Weekly Command.
 */

/**
 * @typedef {Object} CooldownsTimeObject
 * @property {CooldownData} daily Cooldown for Daily Command.
 * @property {CooldownData} work Cooldown for Work Command.
 * @property {CooldownData} weekly Cooldown for Weekly Command.
 */