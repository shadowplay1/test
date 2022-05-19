const EconomyUser = require('../classes/EconomyUser')

const DatabaseManager = require('./DatabaseManager')
const FetchManager = require('./FetchManager')

const BaseManager = require('./BaseManager')
const UtilsManager = require('./UtilsManager')


/**
 * User manager methods class.
 * @extends {BaseManager}
 */
class UserManager extends BaseManager {

    /**
     * User Manager.
     * @param {EconomyOptions} options Economy configuration.
     */
    constructor(options) {
        super(options, null, null, EconomyUser)

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
         * Utils Manager.
         * @type {UtilsManager}
         * @private
         */
        this.utils = new UtilsManager(options, this.database, new FetchManager(options))
    }

    /**
     * Gets the user by it's ID and guild ID.
     * @param {String} userID User ID.
     * @param {String} [guildID] Guild ID.
     * @returns {EconomyUser} User object.
     */
    get(userID, guildID) {
        const user = this.all()
            .find(user => user.id == userID && user.guildID == guildID)

        return user
    }

    /**
     * Creates an economy user object in database.
     * @param {String} memberID The user ID to set.
     * @param {String} guildID Guild ID.
     * @returns {EconomyUser} Economy user object.
     */
    create(memberID, guildID) {
        this.utils.reset(memberID, guildID)

        return this.all().find(user => user.guildID == guildID && user.id == memberID)
    }

    /**
     * Sets the default user object for a specified member.
     * @param {String} userID User ID.
     * @param {String} guildID Guild ID.
     * @returns {Boolean} If reset successfully: true; else: false.
     */
    reset(userID, guildID) {
        return this.utils.reset(userID, guildID)
    }

    /**
     * Gets the array of ALL users in database.
     * @returns {EconomyUser[]}
     */
    all() {
        const userArray = []
        const guildIDs = this.database.keyList('')


        for (const guildID of guildIDs) {
            const usersObject = this.database.fetch(guildID) || []
            const userEntries = Object.entries(usersObject)

            for (const [key, value] of userEntries) {
                if (!isNaN(key)) {
                    value.id = key
                    value.guildID = guildID

                    userArray.push(value)
                }
            }
        }

        return userArray.map(user => {
            const userObject = this.database.fetch(`${user.guildID}.${user.id}`)

            delete userObject.history
            delete userObject.inventory
            delete userObject.bank

            const economyUser = new EconomyUser(user.id, user.guildID, this.options, userObject)

            delete economyUser.storagePath
            delete economyUser.database
            delete economyUser.utils
            delete economyUser.shop


            return economyUser
        })
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
 * User manager class.
 * @type {UserManager}
 */
module.exports = UserManager
