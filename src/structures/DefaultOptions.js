const EconomyOptions = {
    storagePath: './storage.json',
    dailyAmount: 100,
    updateCountdown: 1000,
    workAmount: [10, 50],
    weeklyAmount: 1000,
    dailyCooldown: 86400000,
    workCooldown: 3600000,
    weeklyCooldown: 604800000,
    sellingItemPercent: 75,
    savePurchasesHistory: true,
    deprecationWarnings: true,
    checkStorage: true,
    dateLocale: 'en',
    subtractOnBuy: true,
    updater: {
        checkUpdates: true,
        upToDateMessage: true
    },
    errorHandler: {
        handleErrors: true,
        attempts: 5,
        time: 5000
    },
    optionsChecker: {
        ignoreInvalidTypes: false,
        ignoreUnspecifiedOptions: true,
        ignoreInvalidOptions: false,
        showProblems: true,
        sendLog: true,
        sendSuccessLog: false
    }
}

/**
 * Default Economy options object.
 * @type {EconomyOptions}
 */
module.exports = EconomyOptions
