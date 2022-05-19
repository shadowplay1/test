const DatabaseManager = require('../../managers/DatabaseManager')
const FetchManager = require('../../managers/FetchManager')

const SettingsManager = require('../../managers/SettingsManager')

/**
 * Guild Settings.
 */
class Settings {

    /**
     * Guild settings class.
     * @param {String} guildID Guild ID.
     * @param {EconomyOptions} options Economy configuration.
     */
    constructor(guildID, options) {

        /**
         * Guild ID.
         * @type {String}
         * @private
         */
        this.guildID = guildID

        /**
         * Settings Manager.
         * @type {SettingsManager}
         * @private
         */
        this._settings = new SettingsManager(options, new DatabaseManager(options), new FetchManager(options))
    }

    /**
     * Fetches the server's settings object.
     * @param {String} guildID Guild ID.
     * @returns {SettingsTypes} The server settings object.
     */
    all() {
        return this._settings.all(this, guildID)
    }

    /**
     * Gets the specified setting from the database.
     *
     * Note: If the server don't have any setting specified,
     * the module will take the values from the
     * configuration or default configuration.
     *
     * @param {Settings} key The setting to fetch.
     * @returns {any} The setting from the database.
     */
    get(key) {
        return this._settings.get(key, this.guildID)
    }

    /**
     * Changes the specified setting.
     *
     * Note: If the server don't have any setting specified,
     * the module will take the values from the
     * specified configuration or default configuration.
     *
     * @param {Settings} key The setting to change.
     * @param {any} value The value to set.
     * @returns {SettingsTypes} The server settings object.
     */
    set(key, value) {
        return this._settings.set(key, value, this.guildID)
    }

    /**
     * Removes the specified setting.
     *
     * Note: If the server don't have any setting specified,
     * the module will take the values from the
     * specified configuration or default configuration.
     *
     * @param {Settings} key The setting to remove.
     * @param {String} guildID Guild ID.
     * @returns {SettingsTypes} The server settings object.
     */
    remove(key) {
        return this._settings.remove(key, this.guildID)
    }

    /**
     * Resets all the settings to setting that are in configuration.
     * @param {String} guildID Guild ID.
     * @returns {SettingsTypes} The server settings object.
     */
    reset() {
        return this._settings.reset(this.guildID)
    }
}


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
 * @typedef {Object} SettingsTypes Settings object.
 * @property {Number | Number[]} dailyAmount Amount of money for Daily Command. Default: 100.
 * @property {Number} dailyCooldown Cooldown for Daily Command (in ms). Default: 24 hours (60000 * 60 * 24 ms)
 *
 * @property {Number | Number[]} workAmount Amount of money for Work Command. Default: [10, 50].
 * @property {Number} workCooldown Cooldown for Work Command (in ms). Default: 1 hour (60000 * 60 ms)
 *
 * @property {Number | Number[]} weeklyAmount Amount of money for Weekly Command. Default: 1000.
 * @property {Number} weeklyCooldown Cooldown for Weekly Command (in ms). Default: 7 days (60000 * 60 * 24 * 7 ms)
 *
 * @property {String} dateLocale The region (example: 'ru' or 'en') to format the date and time. Default: 'en'
 * @property {Boolean} subtractOnBuy
 * If true, when someone buys the item, their balance will subtract by item price. Default: false.
 *
 * @property {Number} sellingItemPercent Percent of the item's price it will be sold for. Default: 75.
 */

/**
 * @typedef {'dailyAmount' | 'dailyCooldown' |
 * 'workAmount' | 'workCooldown' |
 * 'weeklyAmount' | 'weeklyCooldown' |
 * 'dateLocale' | 'subtractOnBuy' |
 * 'sellingItemPercent' | 'savePurchasesHistory'} Settings
 */

/**
 * Guild Settings.
 * @type {Settings}
 */
module.exports = Settings
