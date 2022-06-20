const EconomyUser = require('../classes/EconomyUser')

const DatabaseManager = require('./DatabaseManager')

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
     * @param {DatabaseManager} database Database manager.
     * @param {string} guildID Guild ID.
     */
    constructor(options, database, guildID) {
        super(options, null, guildID, EconomyUser, database)

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
        this.database = database

        /**
         * Utils Manager.
         * @type {UtilsManager}
         * @private
         */
        this.utils = new UtilsManager(options, this.database)
    }

    /**
     * Gets the user by it's ID and guild ID.
     * @param {string} userID User ID.
     * @param {string} [guildID] Guild ID.
     * @returns {Promise<EconomyUser>} User object.
     */
    async get(userID, guildID) {
        const allUsers = await this.all()
        return allUsers.find(user => user.guildID == (guildID || this.guildID) && user.id == userID)
    }

    /**
     * Creates an economy user object in database.
     * @param {string} memberID The user ID to set.
     * @param {string} [guildID] Guild ID.
     * @returns {Promise<EconomyUser>} Economy user object.
     */
    async create(memberID, guildID) {
        const result = await this.utils.resetUser(memberID, guildID || this.guildID)
        return result
    }

    /**
     * Sets the default user object for a specified member.
     * @param {string} userID User ID.
     * @param {string} [guildID] Guild ID.
     * @returns {Promise<boolean>} If reset successfully: true; else: false.
     */
    async reset(userID, guildID) {
        await this.utils.resetUser(userID, guildID || this.guildID)
        return true
    }

    /**
     * Gets the array of ALL users in database.
     * @returns {Promise<EconomyUser[]>}
     */
    async all() {
        const userArray = []
        const users = []

        const guildIDs = await this.database.keyList('')

        for (const guildID of guildIDs) {
            const usersObject = (await this.database.fetch(guildID)) || {}
            const userEntries = Object.entries(usersObject)

            for (const [key, value] of userEntries) {
                if (!Array.isArray(value) && typeof value == 'object') {
                    value.id = key
                    value.guildID = guildID

                    userArray.push(value)
                }
            }
        }

        for (const user of userArray) {
            const userObject = await this.database.fetch(`${user.guildID}.${user.id}`)

            delete userObject.history
            delete userObject.inventory
            delete userObject.bank

            const economyUser = new EconomyUser(user.id, user.guildID, this.options, userObject, this.database)

            delete economyUser.connection
            delete economyUser.database
            delete economyUser.utils
            delete economyUser.shop

            users.push(economyUser)
        }

        return users
    }
}


/**
 * @typedef {object} EconomyOptions Default Economy configuration.
 * @property {number} [dailyCooldown=86400000] 
 * Cooldown for Daily Command (in ms). Default: 24 hours (60000 * 60 * 24 ms)
 * 
 * @property {number} [workCooldown=3600000] Cooldown for Work Command (in ms). Default: 1 hour (60000 * 60 ms)
 * @property {Number | Number[]} [dailyAmount=100] Amount of money for Daily Command. Default: 100.
 * @property {number} [weeklyCooldown=604800000] 
 * Cooldown for Weekly Command (in ms). Default: 7 days (60000 * 60 * 24 * 7 ms)
 * 
 * @property {boolean} [deprecationWarnings=true] 
 * If true, the deprecation warnings will be sent in the console. Default: true.
 * 
 * @property {boolean} [savePurchasesHistory=true] If true, the module will save all the purchases history.
 *
 * @property {number} [sellingItemPercent=75] 
 * Percent of the item's price it will be sold for. Default: 75.
 * 
 * @property {Number | Number[]} [weeklyAmount=100] Amount of money for Weekly Command. Default: 1000.
 * @property {Number | Number[]} [workAmount=[10, 50]] Amount of money for Work Command. Default: [10, 50].
 * @property {boolean} [subtractOnBuy=true] 
 * If true, when someone buys the item, their balance will subtract by item price. Default: false
 * 
 * @property {string} [dateLocale='en'] The region (example: 'ru' or 'en') to format the date and time. Default: 'en'.
 * @property {UpdaterOptions} [updater=UpdaterOptions] Update checker configuration.
 * @property {ErrorHandlerOptions} [errorHandler=ErrorHandlerOptions] Error handler configuration.
 * @property {CheckerOptions} [optionsChecker=CheckerOptions] Configuration for an 'Economy.utils.checkOptions' method.
 * @property {boolean} [debug=false] Enables or disables the debug mode.
 */

/**
 * User manager class.
 * @type {UserManager}
 */
module.exports = UserManager
