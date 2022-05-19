const { existsSync, readFileSync, writeFileSync } = require('fs')
const { promisify } = require('util')

const DatabaseManager = require('./managers/DatabaseManager')
const FetchManager = require('./managers/FetchManager')

const UtilsManager = require('./managers/UtilsManager')

const BalanceManager = require('./managers/BalanceManager')
const BankManager = require('./managers/BankManager')

const RewardManager = require('./managers/RewardManager')
const CooldownManager = require('./managers/CooldownManager')

const ShopManager = require('./managers/ShopManager')
const InventoryManager = require('./managers/InventoryManager')
const HistoryManager = require('./managers/HistoryManager')

const UserManager = require('./managers/UserManager')
const SettingsManager = require('./managers/SettingsManager')


const Emitter = require('./classes/util/Emitter')
const EconomyError = require('./classes/util/EconomyError')

const errors = require('./structures/errors')
const GuildManager = require('./managers/GuildManager')

const Logger = require('./classes/util/Logger')


/**
 * The main Economy class.
 */
class Economy extends Emitter {

    /**
    * The Economy class.
    * @param {EconomyOptions} options Economy configuration.
    */
    constructor(options = {}) {
        super()

        /**
         * Module ready status.
         * @type {?Boolean}
         */
        this.ready = false

        /**
         * Economy errored status.
         * @type {?Boolean}
         */
        this.errored = false

        /**
        * Module version.
        * @type {String}
        */
        this.version = require('../package.json').version

        /**
         * The Logger class.
         * @type {Logger}
         * @private
         */
        this._logger = new Logger(options)

        if (options.debug) {
            this._logger.debug('Economy version: ' + this.version, 'lightcyan')
        }

        /**
         * Link to the module's documentation website.
         * @type {String}
         */
        this.docs = 'https://des-docs.tk'

        /**
        * Utils manager methods object.
        * @type {UtilsManager}
        */
        this.utils = new UtilsManager(options, new DatabaseManager(options), new FetchManager(options))

        /**
         * Economy configuration.
         * @type {?EconomyOptions}
         */
        this.options = this.utils.checkOptions(options.optionsChecker, options)

        /**
         * Econoomy managers list. Made for optimization purposes.
         * @type {Manager[]}
         */
        this.managers = []

        /**
         * Colors object.
         * @type {LoggerColors}
         */
        this.colors = this._logger.colors

        /**
         * Database checking interval.
         * @type {?NodeJS.Timeout}
        */
        this.interval = null

        /**
         * Economy error class.
         * @type {EconomyError}
         */
        this.EconomyError = EconomyError

        /**
         * Emitter class.
         * @type {Emitter}
         */
        this.Emitter = Emitter

        /**
        * Balance methods object.
        * @type {BalanceManager}
        */
        this.balance = null

        /**
        * Bank balance methods object.
        * @type {BankManager}
        */
        this.bank = null

        /**
        * Fetch manager methods object.
        * @type {FetchManager}
        */
        this.fetcher = null

        /**
        * Database manager methods object.
        * @type {DatabaseManager}
        */
        this.database = null

        /**
        * Shop manager methods object.
        * @type {ShopManager}
        */
        this.shop = null

        /**
        * Inventory manager methods object.
        * @type {InventoryManager}
        */
        this.inventory = null

        /**
        * History manager methods object.
        * @type {HistoryManager}
        */
        this.history = null

        /**
        * Bank balance methods object.
        * @type {CooldownManager}
        */
        this.cooldowns = null

        /**
        * Balance methods object.
        * @type {RewardManager}
        */
        this.rewards = null

        /**
        * Economy users.
        * @type {UserManager}
        */
        this.users = new UserManager(this.options)

        /**
        * Economy guilds.
        * @type {GuildManager}
        */
        this.guilds = new GuildManager(this.options)

        /**
        * Settings manager methods object.
        * @type {SettingsManager}
        */
        this.settings = null

        /**
         * Economy instance.
         * @type {Economy}
         */
        this.economy = this

        this._logger.debug('Economy starting process launched.')

        this.init().then(status => {
            if (status) {
                this.ready = true

		this._logger.debug('Economy is ready!', 'green')
                this.emit('ready')
            }
        })
    }

    /**
     * Kills the Economy instance.
     * @returns {Economy} Economy instance.
     */
    kill() {
        if (!this.ready) return false

        clearInterval(this.interval)

        for (const manager of this.managers) {
            this[manager.name] = null
        }

        this.ready = false
        this.economy = this

        this._logger.debug('Economy is killed.')
        this.emit('destroy')

        return this
    }

    /**
     * Starts the module.
     * @returns {Promise<Boolean>} If started successfully: true; else: Error instance.
     */
    init() {
        let attempt = 0

        const attempts =
            this.options.errorHandler.attempts == 0 ?
                Infinity :
                this.options.errorHandler.attempts

        const time = this.options.errorHandler.time
        const retryingTime = (time / 1000).toFixed(1)

        const sleep = promisify(setTimeout)

        const check = () => new Promise(resolve => {
            this._init().then(status => {

                if (status) {
                    this.errored = false
                    this.ready = true
                    return console.log(`${this.colors.green}Started successfully!`)
                }

                resolve(status)
            }).catch(err => resolve(err))
        })

        this._logger.debug('Checking the Node.js version...')

        return this.options.errorHandler.handleErrors ? this._init().catch(async err => {
            if (!(err instanceof EconomyError)) this.errored = true

            console.log(`${this.colors.red}Failed to start the module:${this.colors.cyan}`)
            console.log(err)

            if (err.message.includes('This module is only supporting Node.js v14 or newer.')) {
                process.exit(1)
            } else console.log(`${this.colors.magenta}Retrying in ${retryingTime} seconds...${this.colors.reset}`)

            while (attempt < attempts && attempt !== -1) {
                await sleep(time)

                if (attempt < attempts) check().then(async res => {
                    if (res.message) {

                        attempt++

                        console.log(`${this.colors.red}Failed to start the module:${this.colors.cyan}`)
                        console.log(err)
                        console.log(`\x1b[34mAttempt ${attempt}${attempts == Infinity ? '.' : `/${attempts}`}`)

                        if (attempt == attempts) {
                            console.log(
                                `${this.colors.green}Failed to start the module within` +
                                `${attempts} attempts...${this.colors.reset}`
                            )

                            process.exit(1)
                        }

                        console.log(`${this.colors.magenta}Retrying in ${retryingTime} seconds...`)
                        await sleep(time)

                    } else attempt = -1
                })
            }
        }) : this._init()
    }

    /**
     * Initializes the module.
     * @returns {Promise<boolean>} If started successfully: true; else: Error instance.
     * @private
     */
    _init() {
        const reservedNames = ['package.json', 'package-lock.json', 'node_modules', 'mongo']
        const updateCountdown = this.options.updateCountdown

        const isReservedStorage =
            !this.options.storagePath.includes('testStorage123') &&
            !__dirname.includes('discord-economy-super\\tests')

        const isReservedPathUsed =
            !__dirname.includes('discord-economy-super\\tests') &&
            !__dirname.includes('discord-economy-super/tests')

        const isFileExist = existsSync(this.options.storagePath)

        return new Promise(async (resolve, reject) => {
            try {
                if (this.errored) return
                if (this.ready) return

                if (Number(process.version.split('.')[0].slice(1)) < 14) {
                    return reject(new EconomyError('This module is only supporting Node.js v14 or newer.'))
                }

                this._logger.debug('Checking for updates...')

                /* eslint-disable max-len */
                if (this.options.updater.checkUpdates) {
                    const version = await this.utils.checkUpdates()
                    if (!version.updated) {

                        console.log('\n\n')
                        console.log(this.colors.green + '╔══════════════════════════════════════════════════════════╗')
                        console.log(this.colors.green + '║ @ discord-economy-super                           - [] X ║')
                        console.log(this.colors.green + '║══════════════════════════════════════════════════════════║')
                        console.log(this.colors.yellow + `║                 The module is ${this.colors.red}out of date!${this.colors.yellow}               ║`)
                        console.log(this.colors.magenta + '║                  New version is available!               ║')
                        console.log(this.colors.blue + `║                       ${version.installedVersion} --> ${version.packageVersion}                    ║`)
                        console.log(this.colors.cyan + '║          Run "npm i discord-economy-super@latest"        ║')
                        console.log(this.colors.cyan + '║                         to update!                       ║')
                        console.log(this.colors.white + '║               View the full changelog here:              ║')
                        console.log(this.colors.red + `║  https://des-docs.tk/#/docs/main/${version.packageVersion}/general/changelog ║`)
                        console.log(this.colors.green + '╚══════════════════════════════════════════════════════════╝\x1b[37m')
                        console.log('\n\n')

                    } else {
                        if (this.options.updater.upToDateMessage) {

                            console.log('\n\n')
                            console.log(this.colors.green + '╔══════════════════════════════════════════════════════════╗')
                            console.log(this.colors.green + '║ @ discord-economy-super                           - [] X ║')
                            console.log(this.colors.green + '║══════════════════════════════════════════════════════════║')
                            console.log(this.colors.yellow + `║                  The module is ${this.colors.cyan}up to date!${this.colors.yellow}               ║`)
                            console.log(this.colors.magenta + '║                  No updates are available.               ║')
                            console.log(this.colors.blue + `║                  Current version is ${version.packageVersion}.               ║`)
                            console.log(this.colors.cyan + '║                           Enjoy!                         ║')
                            console.log(this.colors.white + '║               View the full changelog here:              ║')
                            console.log(this.colors.red + `║  https://des-docs.tk/#/docs/main/${version.packageVersion}/general/changelog ║`)
                            console.log(this.colors.green + '╚══════════════════════════════════════════════════════════╝\x1b[37m')
                            console.log('\n\n')

                        }
                    }
                } else this._logger.debug('Skipped the updates checking...')

                if (this.options.checkStorage == undefined ? true : this.options.checkStorage) {
                    this._logger.debug('Checking for reserved words in a storage file path...')

                    if (!isFileExist && isReservedStorage) writeFileSync(this.options.storagePath, '{}')

                    try {
                        if (this.options.storagePath.includes('testStorage123') && isReservedPathUsed) {
                            return reject(new EconomyError(errors.reservedName('testStorage123')))
                        }

                        for (const name of reservedNames) {
                            if (this.options.storagePath.endsWith(name)) {
                                return reject(new EconomyError(errors.reservedName(name)))
                            }
                        }

                        this._logger.debug('Checking the data in a storage file...')

                        const data = readFileSync(this.options.storagePath)
                        JSON.parse(data.toString())

                    } catch (err) {
                        if (err.message.includes('Unexpected') && err.message.includes('JSON')) {
                            return reject(new EconomyError(errors.wrongStorageData))
                        }

                        else return reject(err)
                    }

                    this._logger.debug(
                        `Using storage file: ${this.options.storagePath}` +
                        `${this.options.checkStorage ? `, checking every ${updateCountdown}ms.` : '.'}`, 'cyan'
                    )
                }

                if (this.options.checkStorage == undefined ? true : this.options.checkStorage) {
                    const storageExists = existsSync(this.options.storagePath)

                    const interval = setInterval(() => {
                        if (!storageExists) {
                            this._logger.debug('Checking for reserved words in a storage file path...')

                            try {
                                const isReservedPathUsed =
                                    this.options.storagePath.includes('testStorage123') &&
                                    !__dirname.includes('discord-economy-super\\tests')

                                if (isReservedPathUsed) {
                                    throw new EconomyError(errors.reservedName('testStorage123'))
                                }

                                for (const name of reservedNames) {
                                    if (this.options.storagePath.endsWith(name)) {
                                        throw new EconomyError(errors.reservedName(name))
                                    }
                                }

                                writeFileSync(this.options.storagePath, '{}', 'utf-8')
                            } catch (err) {
                                throw new EconomyError(errors.notReady)
                            }

                            console.log(
                                `${this.colors.red}failed to find a database file;` +
                                `created another one...${this.colors.reset}`
                            )
                        }

                        try {
                            if (!storageExists) writeFileSync(this.options.storagePath, '{}', 'utf-8')

                            const data = readFileSync(this.options.storagePath)
                            JSON.parse(data.toString())

                        } catch (err) {
                            if (err.message.includes('Unexpected token') ||
                                err.message.includes('Unexpected end')) {
                                reject(new EconomyError(errors.wrongStorageData))
                            }

                            else {
                                reject(err)
                                throw err
                            }
                        }

                    }, updateCountdown)
                    this.interval = interval
                }

                this._logger.debug('Starting the managers...', 'lightyellow')
                this.start()

                return resolve(true)

            } catch (err) {
                this._logger.debug('Failed to start.', 'red')

                this.errored = true
                reject(err)
            }
        })
    }

    /**
     * Starts all the managers.
     * @returns {Boolean} If successfully started: true.
     * @private
     */
    start() {
        const managers = [
            {
                name: 'utils',
                manager: UtilsManager
            },
            {
                name: 'balance',
                manager: BalanceManager
            },
            {
                name: 'bank',
                manager: BankManager
            },
            {
                name: 'fetcher',
                manager: FetchManager
            },
            {
                name: 'database',
                manager: DatabaseManager
            },
            {
                name: 'shop',
                manager: ShopManager
            },
            {
                name: 'inventory',
                manager: InventoryManager
            },
            {
                name: 'history',
                manager: HistoryManager
            },
            {
                name: 'rewards',
                manager: RewardManager
            },
            {
                name: 'cooldowns',
                manager: CooldownManager
            },
            {
                name: 'users',
                manager: UserManager
            },
            {
                name: 'guilds',
                manager: GuildManager
            },

            {
                name: 'settings',
                manager: SettingsManager
            },
        ]

        const events = [
            'balanceSet',
            'balanceAdd',
            'balanceSubtract',
            'bankSet',
            'bankAdd',
            'bankSubtract',
            'shopItemAd',
            'shopClear',
            'shopItemEdit',
            'shopItemBuy',
            'shopItemUse',
            'ready',
            'destroy'
        ]


        for (const manager of managers) {
            this[manager.name] = new manager.manager(this.options, new DatabaseManager(this.options))
            this._logger.debug(`${manager.manager.name} is started.`)
        }

        for (const event of events) {
            this.on(event, () => {
                this._logger.debug(`"${event}" event is emitted.`)
            })
        }

        this.managers = managers
        this.economy = this

        return true
    }
}

/**
* Emits when someone's set the money on the balance.
* @event Economy#balanceSet
* @param {Object} data Data object.
* @param {String} data.type The type of operation.
* @param {String} data.guildID Guild ID.
* @param {String} data.memberID Member ID.
* @param {Number} data.amount Amount of money in completed operation.
* @param {Number} data.balance User's balance after the operation was completed successfully.
* @param {String} data.reason The reason why the operation was completed.
*/

/**
* Emits when someone's added the money on the balance.
* @event Economy#balanceAdd
* @param {Object} data Data object.
* @param {String} data.type The type of operation.
* @param {String} data.guildID Guild ID.
* @param {String} data.memberID Member ID.
* @param {Number} data.amount Amount of money in completed operation.
* @param {Number} data.balance User's balance after the operation was completed successfully.
* @param {String} data.reason The reason why the operation was completed.
*/

/**
* Emits when someone's subtracts the money from user's balance.
* @event Economy#balanceSubtract
* @param {Object} data Data object.
* @param {String} data.type The type of operation.
* @param {String} data.guildID Guild ID.
* @param {String} data.memberID Member ID.
* @param {Number} data.amount Amount of money in completed operation.
* @param {Number} data.balance User's balance after the operation was completed successfully.
* @param {String} data.reason The reason why the operation was completed.
*/

/**
* Emits when someone's set the money on the bank balance.
* @event Economy#bankSet
* @param {Object} data Data object.
* @param {String} data.type The type of operation.
* @param {String} data.guildID Guild ID.
* @param {String} data.memberID Member ID.
* @param {Number} data.amount Amount of money in completed operation.
* @param {Number} data.balance User's balance after the operation was completed successfully.
* @param {String} data.reason The reason why the operation was completed.
*/

/**
* Emits when someone's added the money on the bank balance.
* @event Economy#bankAdd
* @param {Object} data Data object.
* @param {String} data.type The type of operation.
* @param {String} data.guildID Guild ID.
* @param {String} data.memberID Member ID.
* @param {Number} data.amount Amount of money in completed operation.
* @param {Number} data.balance User's balance after the operation was completed successfully.
* @param {String} data.reason The reason why the operation was completed.
*/

/**
* Emits when someone's subtracts the money from user's bank balance.
* @event Economy#bankSubtract
* @param {Object} data Data object.
* @param {String} data.type The type of operation.
* @param {String} data.guildID Guild ID.
* @param {String} data.memberID Member ID.
* @param {Number} data.amount Amount of money in completed operation.
* @param {Number} data.balance User's balance after the operation was completed successfully.
* @param {String} data.reason The reason why the operation was completed.
*/

/**
* Emits when someone's added an item in the shop.
* @event Economy#shopItemAdd
* @param {Number} id Item ID.
* @param {String} data.name Item name.
* @param {Number} data.price Item price.
* @param {String} data.message Item message that will be returned on item use.
* @param {String} data.description Item description.
* @param {Number} data.maxAmount Max amount of the item that user can hold in their inventory.
* @param {String} data.role Role ID from your Discord server.
* @param {String} data.date Formatted date when the item was added to the shop.
*/

/**
* Emits when someone's removed an item in the shop.
* @event Economy#shopItemRemove
* @param {Number} id Item ID.
* @param {String} data.name Item name.
* @param {Number} data.price Item price.
* @param {String} data.message Item message that will be returned on item use.
* @param {String} data.description Item description.
* @param {Number} data.maxAmount Max amount of the item that user can hold in their inventory.
* @param {String} data.role Role ID from your Discord server.
* @param {String} data.date Formatted date when the item was added to the shop.
*/

/**
* Emits when someone's added an item in the shop.
* @event Economy#shopItemBuy
* @param {Number} id Item ID.
* @param {String} data.name Item name.
* @param {Number} data.price Item price.
* @param {String} data.message Item message that will be returned on item use.
* @param {String} data.description Item description.
* @param {Number} data.maxAmount Max amount of the item that user can hold in their inventory.
* @param {String} data.role Role ID from your Discord server.
* @param {String} data.date Formatted date when the item was added to the shop.
*/

/**
* Emits when someone's used an item from their inventory.
* @event Economy#shopItemUse
* @param {Number} id Item ID.
* @param {String} data.name Item name.
* @param {Number} data.price Item price.
* @param {String} data.message Item message that will be returned on item use.
* @param {String} data.description Item description.
* @param {Number} data.maxAmount Max amount of the item that user can hold in their inventory.
* @param {String} data.role Role ID from your Discord server.
* @param {String} data.date Formatted date when the item was added to the shop.
*/

/**
* Emits when someone's edited an item in the shop.
* @event Economy#shopItemEdit
* @param {Number} id Item ID.
* @param {String} data.guildID Guild ID.
* @param {String} data.changedProperty The item property that was changed.
* @param {String} data.oldValue Value before edit.
* @param {String} data.newValue Value after edit.
*/

/**
* Emits when the module is ready.
* @event Economy#ready
* @param {void} data Void event.
*/

/**
* Emits when the module is destroyed.
* @event Economy#destroy
* @param {void} data Void event.
*/

/**
 * @typedef {Object} EconomyOptions Default Economy configuration.
 * @property {String} [storagePath='./storage.json'] Full path to a JSON file. Default: './storage.json'
 * @property {Boolean} [checkStorage=true] Checks the if database file exists and if it has errors. Default: true
 * @property {Number} [dailyCooldown=86400000] Cooldown for Daily Command (in ms). Default: 24 hours (60000 * 60 * 24 ms)
 * @property {Number} [workCooldown=3600000] Cooldown for Work Command (in ms). Default: 1 hour (60000 * 60 ms)
 * @property {Number | Number[]} [dailyAmount=100] Amount of money for Daily Command. Default: 100.
 * @property {Number} [weeklyCooldown=604800000] Cooldown for Weekly Command (in ms). Default: 7 days (60000 * 60 * 24 * 7 ms)
 * @property {Number} [sellingItemPercent=75] 
 * Percent of the item's price it will be sold for. Default: 75.
 * 
 * @property {Boolean} [deprecationWarnings=true] 
 * If true, the deprecation warnings will be sent in the console. Default: true.
 * 
 * @property {Boolean} [savePurchasesHistory=true] If true, the module will save all the purchases history.
 * 
 * @property {Number | Number[]} [weeklyAmount=100] Amount of money for Weekly Command. Default: 1000.
 * @property {Number | Number[]} [workAmount=[10, 50]] Amount of money for Work Command. Default: [10, 50].
 * @property {Boolean} [subtractOnBuy=true] If true, when someone buys the item, their balance will subtract by item price. Default: false
 * 
 * @property {Number} [updateCountdown=1000] Checks for if storage file exists in specified time (in ms). Default: 1000.
 * @property {String} [dateLocale='en'] The region (example: 'ru' or 'en') to format the date and time. Default: 'en'.
 * @property {UpdaterOptions} [updater=UpdaterOptions] Update checker configuration.
 * @property {ErrorHandlerOptions} [errorHandler=ErrorHandlerOptions] Error handler configuration.
 * @property {CheckerOptions} [optionsChecker=CheckerOptions] Configuration for an 'Economy.utils.checkOptions' method.
 * @property {Boolean} [debug=false] Enables or disables the debug mode.
 */

/**
 * @typedef {Object} UpdaterOptions Update checker configuration.
 * @property {Boolean} [checkUpdates=true] Sends the update state message in console on start. Default: true.
 * @property {Boolean} [upToDateMessage=true] Sends the message in console on start if module is up to date. Default: true.
 */

/**
 * @typedef {Object} ErrorHandlerOptions
 * @property {Boolean} [handleErrors=true] Handles all errors on startup. Default: true.
 * @property {Number} [attempts=5] Amount of attempts to load the module. Use 0 for infinity attempts. Default: 5.
 * @property {Number} [time=3000] Time between every attempt to start the module (in ms). Default: 3000.
 */

/**
 * @typedef {Object} CheckerOptions Configuration for an 'Economy.utils.checkOptions' method.
 * @property {Boolean} [ignoreInvalidTypes=false] Allows the method to ignore the options with invalid types. Default: false.
 * @property {Boolean} [ignoreUnspecifiedOptions=false] Allows the method to ignore the unspecified options. Default: false.
 * @property {Boolean} [ignoreInvalidOptions=false] Allows the method to ignore the unexisting options. Default: false.
 * @property {Boolean} [showProblems=false] Allows the method to show all the problems in the console. Default: false. 
 * 
 * @property {Boolean} [sendLog=false] Allows the method to send the result in the console. 
 * Requires the 'showProblems' or 'sendLog' options to set. Default: false.
 * 
 * @property {Boolean} [sendSuccessLog=false] Allows the method to send the result if no problems were found. Default: false.
 */

/**
 * @typedef {Object} LoggerColors
 * @property {String} red Red color.
 * @property {String} green Green color.
 * @property {String} yellow Yellow color.
 * @property {String} blue Blue color.
 * @property {String} magenta Magenta color.
 * @property {String} cyan Cyan color.
 * @property {String} white White color.
 * @property {String} reset Reset color.
 */

/**
 * @typedef {Object} Manager
 * @property {String} name The manager's short name.
 * @property {Function} manager The manager class.
 */


/**
 * The Economy class.
 * @type {Economy}
 */
module.exports = Economy
