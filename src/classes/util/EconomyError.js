/**
 * EconomyError class.
 * @extends Error
 */
class EconomyError extends Error {

    /**
     * Creates an 'EconomyError' instance.
     * @param {string | Error} message Error message.
     */
    constructor(message) {
        if (message instanceof Error == 'Error') {
            super(message.message)
            Error.captureStackTrace(this, this.constructor)
        }

        if (typeof message == 'string') super(message)

        /**
         * Error name.
         * @type {string}
         */
        this.name = 'EconomyError'
    }
}

/**
 * EconomyError class.
 * @type {EconomyError}
 */
module.exports = EconomyError