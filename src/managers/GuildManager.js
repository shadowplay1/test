const EconomyGuild = require('../classes/EconomyGuild')

const BaseManager = require('./BaseManager')

const DatabaseManager = require('./DatabaseManager')
const FetchManager = require('./FetchManager')

const UtilsManager = require('./UtilsManager')
const UserManager = require('./UserManager')

const EconomyError = require('../classes/util/EconomyError')
const errors = require('../structures/errors')


/**
 * User manager methods class.
 * @extends {BaseManager}
 */
class GuildManager extends BaseManager {

    /**
     * Guild Manager.
     * @param {EconomyOptions} options Economy configuration.
     */
    constructor(options) {
        super(options, null, null, EconomyGuild)


        /**
         * Economy configuration.
         * @type {EconomyOptions}
         * @private
         */
        this.options = options

        /**
         * Database Manager.
         * @type {DatabaseManager}
         * @private
         */
        this.database = new DatabaseManager(options)

        /**
         * User Manager.
         * @type {UserManager}
         * @private
         */
        this._users = new UserManager(options)

        /**
         * Utils Manager.
         * @type {UtilsManager}
         * @private
         */
        this.utils = new UtilsManager(options, this.database, new FetchManager(options))
    }

    /**
     * Gets the guild by it's ID.
     * @param {String} guildID Guild ID.
     * @returns {EconomyGuild} User object.
     */
    get(guildID) {
        const user = this.all().find(guild => guild.id == guildID)

        return user
    }

    /**
     * Creates an economy guild object in database.
     * @param {String} guildID The guild ID to set.
     * @returns {EconomyGuild} Economy user object.
     */
    create(guildID) {
        this.reset(guildID)

        return this.all().find(guild => guild.id == guildID)
    }

    /**
     * Sets the default guild object for a specified member.
     * @param {String} guildID Guild ID.
     * @returns {boolean} If reset successfully: true; else: false.
     */
    reset(guildID) {
        if (!guildID) throw new EconomyError(errors.invalidTypes.guildID)

        return this.database.set(guildID, {
            shop: [],
            settings: []
        })
    }

    /**
     * Gets the array of ALL guilds in database.
     * @returns {EconomyGuild[]}
     */
    all() {
        const guildsArray = []
        const guildIDs = this.database.keyList('')


        for (const guildID of guildIDs) {
            const guildObject = this.database.fetch(guildID) || []

            guildObject.id = guildID
            guildsArray.push(guildObject)
        }


        return guildsArray.map(guild => new EconomyGuild(guild.id, this.options, guild))
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
 * @property {Boolean} [deprecationWarnings=true] 
 * If true, the deprecation warnings will be sent in the console. Default: true.
 * 
 * @property {Boolean} [savePurchasesHistory=true] If true, the module will save all the purchases history.
 *
 * @property {Number} [sellingItemPercent=75] 
 * Percent of the item's price it will be sold for. Default: 75.
 * 
 * @property {Number | Number[]} [weeklyAmount=100] Amount of money for Weekly Command. Default: 1000.
 * @property {Number | Number[]} [workAmount=[10, 50]] Amount of money for Work Command. Default: [10, 50].
 * @property {Boolean} [subtractOnBuy=true] 
 * If true, when someone buys the item, their balance will subtract by item price. Default: false
 * 
 * @property {Number} [updateCountdown=1000] Checks for if storage file exists in specified time (in ms). Default: 1000.
 * @property {String} [dateLocale='en'] The region (example: 'ru' or 'en') to format the date and time. Default: 'en'.
 * @property {UpdaterOptions} [updater=UpdaterOptions] Update checker configuration.
 * @property {ErrorHandlerOptions} [errorHandler=ErrorHandlerOptions] Error handler configuration.
 * @property {CheckerOptions} [optionsChecker=CheckerOptions] Configuration for an 'Economy.utils.checkOptions' method.
 * @property {Boolean} [debug=false] Enables or disables the debug mode.
 */

/**
 * Guild manager class.
 * @type {BaseManager<GuildManager>}
 */
module.exports = GuildManager
