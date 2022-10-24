const DatabaseManager = require('../managers/DatabaseManager')

/**
* Balance item class.
*/
class BalanceItem {

    /**
     * User balance class.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @param {EconomyOptions} ecoOptions Economy configuration.
     * @param {BalanceObject} balanceObject User balance object.
     * @param {DatabaseManager} database Database manager.
     */
    constructor(memberID, guildID, ecoOptions, balanceObject, database) {

        /**
         * Member ID.
         * @type {string}
         */
        this.memberID = memberID

        /**
         * Guild ID.
         * @type {string}
         */
        this.guildID = guildID

        /**
         * User's balance.
         * @type {number}
         */
        this.money = balanceObject.money

        /**
         * User balance object.
         * @type {number}
         */
        this.bank = balanceObject.bank
    }
}


/**
 * Balance object.
 * @typedef {Object} BalanceObject
 * @property {number} money User's money amount.
 * @property {number} bank User's bank balance.
 */

module.exports = BalanceItem
