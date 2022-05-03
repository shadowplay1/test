/**
* Economy logger.
* @private
*/
class Logger {

    /**
     * Logger constructor.
     * @param {LoggerOptions} options Logger options object.
    */
    constructor(options) {

        /**
         * Logger options object.
         * @type {LoggerOptions}
         */
        this.options = options

        /**
         * Logger colors object.
         * @type {LoggerColors}
        */
        this.colors = {
            black: '\x1b[30m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m',
            lightgray: '\x1b[37m',
            default: '\x1b[39m',
            darkgray: '\x1b[90m',
            lightred: '\x1b[91m',
            lightgreen: '\x1b[92m',
            lightyellow: '\x1b[93m',
            lightblue: '\x1b[94m',
            lightmagenta: '\x1b[95m',
            lightcyan: '\x1b[96m',
            white: '\x1b[97m',
            reset: '\x1b[0m',
        }
    }

    /**
     * Sends an info message to the console.
     * @param {String} message A message to send.
     * @param {String} [color='red'] Message color to use.
     */
    info(message, color = 'cyan') {
        console.log(`${this.colors[color]}[Economy] ${message}${this.colors.reset}`)
    }

    /**
     * Sends an error message to the console.
     * @param {String} message A message to send.
     * @param {String} [color='red'] Message color to use.
     */
    error(message, color = 'red') {
        console.error(`${this.colors[color]}[Economy - Error] ${message}${this.colors.reset}`)
    }

    /**
     * Sends a debug message to the console.
     * @param {String} message A message to send.
     * @param {String} [color='yellow'] Message color to use.
     */
    debug(message, color = 'yellow') {
        if (!this.options.debug) return // this.error('Debug mode is disabled.')
        console.log(`${this.colors[color]}[Economy] ${message}${this.colors.reset}`)
    }
}


/**
 * The Logger class.
 * @type {Logger}
 */
module.exports = Logger


/**
 * @typedef {Object} LoggerOptions
 * @property {Boolean} debug Is the debug mode enabled.
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
 * @property {String} black Black color.
 * @property {String} lightgray Light gray color.
 * @property {String} darkgray Dark gray color.
 * @property {String} lightred Light red color.
 * @property {String} lightgreen Light green color.
 * @property {String} lightyellow Light yellow color.
 * @property {String} lightblue Light blue color.
 * @property {String} lightmagenta Light magenta color.
 * @property {String} lightcyan Light cyan color.
 */