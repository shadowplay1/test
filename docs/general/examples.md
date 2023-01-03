# Discord Economy Super

[![Downloads](https://img.shields.io/npm/dt/discord-economy-super?style=for-the-badge)](https://www.npmjs.com/package/discord-economy-super)
[![Stable Version](https://img.shields.io/npm/v/discord-economy-super?style=for-the-badge)](https://www.npmjs.com/package/discord-economy-super)

<b>Discord Economy Super</b> - Easy and customizable economy module for your [Discord Bot](https://discord.js.org/#/).

## Initialation Example

```js
const { Client } = require('discord.js');
const Economy = require('discord-economy-super');

const client = new Client({
  intents: ['GuildMembers', 'GuildMessages'],
});


// these options are optional (and these values are default in the module),
// they were made to configure the module.

// to change these values for specific guilds, use SettingsManager:
// https://des-docs.js.org/#/docs/main/1.7.4/class/SettingsManager

let eco = new Economy({
    storagePath: './storage.json',
    updateCountdown: 1000,
    checkStorage: true,
    deprecationWarnings: true,
    sellingItemPercent: 75,
    savePurchasesHistory: true,
    dailyAmount: 100,
    workAmount: [10, 50],
    weeklyAmount: 1000,
    dailyCooldown: 60000 * 60 * 24,
    workCooldown: 60000 * 60,
    weeklyCooldown: 60000 * 60 * 24 * 7,
    dateLocale: 'en',
    updater: {
        checkUpdates: true,
        upToDateMessage: true
    },
    errorHandler: {
        handleErrors: true,
        attempts: 5,
        time: 3000
    },
    optionsChecker: {
        ignoreInvalidTypes: false,
        ignoreUnspecifiedOptions: true,
        ignoreInvalidOptions: false,
        showProblems: true,
        sendLog: true,
        sendSuccessLog: false
    }
});

client.on('ready', () => {
  console.log(`${client.user.tag} is ready!`);
});

eco.on('ready', economy => {
  console.log(`Economy is ready!`);
  eco = economy
})

client.login('token');
```

## Balance Command

```js
if (command == prefix + 'balance') {
  const [userID] = args
  const guild = eco.guilds.get(message.guild.id)

  const user = guild.users.get(
      message.mentions.users.first()?.id ||
      message.guild.users.get(userID) ||
      message.author.id
)

  const [balance, bank] = [
      user.balance.get(),
      user.bank.get()
  ]

  message.channel.send(
      `${message.author}'s balance:\n` +
      `Coins: **${balance}**.\n` +
      `Coins in bank: **${bank}**.`
  )
}
```

## Daily, Work and Weekly Commands

```js
if (command == prefix + 'daily') {
  const guild = eco.guilds.get(message.guild.id)
  const user = guild.users.get(message.author.id)

  const dailyResult = user.rewards.getDaily<false>()

  if (dailyResult.cooldown) {
      return message.channel.send(
          `${message.author}, you can claim your daily reward in ${dailyResult.cooldown.pretty}.`
      )
  }

  message.channel.send(
      `${message.author}, you claimed your **${dailyResult.reward}** daily coins!`
  )
}


if (command == prefix + 'work') {
  const guild = eco.guilds.get(message.guild.id)
  const user = guild.users.get(message.author.id)

  const workResult = user.rewards.getWork<true>()

  if (workResult.cooldown) {
      return message.channel.send(
          `${message.author}, you can work again in ${workResult.cooldown.pretty}.`
      )
  }

  message.channel.send(
      `${message.author}, you worked hard and earned **${workResult.reward}** coins!`
  )
}


if (command == prefix + 'weekly') {
  const guild = eco.guilds.get(message.guild.id)
  const user = guild.users.get(message.author.id)

  const weeklyResult = user.rewards.getWeekly<true>()

  if (weeklyResult.cooldown) {
      return message.channel.send(
          `${message.author}, you can claim your weekly reward in ${weeklyResult.cooldown.pretty}.`
      )
  }

  message.channel.send(
      `${message.author}, you claimed your **${weeklyResult.reward}** weekly coins!`
  )
}
```

## Deposit & Withdraw Commands

```js
if (command == prefix + 'deposit') {
  const guild = eco.guilds.get(message.guild.id)
  const user = guild.users.get(message.author.id)

  const userBalance = user.balance.get()
  const amount = parseInt(args[0])

  if (userBalance < amount) {
      return message.channel.send(
          `${message.author}, you don't have enough coins` +
          `to perform this deposit.`
      )
  }

  user.balance.subtract(amount, `depositted ${amount} coins`)
  user.bank.add(amount, `depositted ${amount} coins`)

  message.channel.send(
      `${message.author}, you deposited **${amount}** coins to your bank.`
  )
}


if (command == prefix + 'withdraw') {
  const guild = eco.guilds.get(message.guild.id)
  const user = guild.users.get(message.author.id)

  const userBankBalance = user.bank.get()
  const amount = parseInt(args[0])

  if (userBankBalance < amount) {
      return message.channel.send(
          `${message.author}, you don't have enough coins` +
          `in your bank to perform this withdraw.`
      )
  }

  user.bank.subtract(amount, `withdrew ${amount} coins`)
  user.balance.add(amount, `withdrew ${amount} coins`)

  message.channel.send(
      `${message.author}, you withdrew **${amount}** coins from your bank.`
  )
}
```

# Currencies

```js
// Create a currency
if (command == prefix + 'createCurrency') {
    const [name, symbol] = args
    
    eco.currencies.create(name, symbol, message.guild.id)
    message.channel.send(`Successfully created a new **${name} (${symbol})** currency!`)
}

// Check the currency balance
if (command == prefix + 'currencyBalance') {
    const [userID] = args
    const guild = eco.guilds.get(message.guild.id)

    const guildUser = guild.users.get(
        message.mentions.users.first()?.id ||
        message.guild.users.get(userID) ||
        message.author.id
    )

    const user = guild.users.get(guildUser.id)

    const [currencyBalance, currency] = [
        user.balance.currency('currencyID/currencyName/currencySymbol').get(),
        user.balance.currency('currencyID/currencyName/currencySymbol').getCurrency()
    ]

    message.channel.send(
        `${message.author}'s balance: **${currencyBalance}** ${currency.symbol}`
    )
}

// Add the money on currency balance
if (command == prefix + 'currencyBalance') {
    const [userID, amount] = args
    const guild = eco.guilds.get(message.guild.id)

    const guildUser = guild.users.get(
        message.mentions.users.first()?.id ||
        message.guild.users.get(userID) ||
        message.author.id
    )

    const user = guild.users.get(guildUser.id)

    user.balance.currency('currencyID/currencyName/currencySymbol').add(amount)
    message.channel.send('Adding successful!')
}

// Subtract the money from currency balance
if (command == prefix + 'currencyBalance') {
    const [userID, amount] = args
    const guild = eco.guilds.get(message.guild.id)

    const guildUser = guild.users.get(
        message.mentions.users.first()?.id ||
        message.guild.users.get(userID) ||
        message.author.id
    )

    const user = guild.users.get(guildUser.id)

    user.balance.currency('currencyID/currencyName/currencySymbol').subtract(amount)
    message.channel.send('Subtracting successful!')
}
```
See the full bot examples for both MongoDB and JSON databases in both JavaScript and TypeScript [here](https://github.com/shadowplay1/discord-economy-super/tree/main/examples)!

## ❗ | Useful Links

<ul>
<li><b><a href = 'https://www.npmjs.com/package/discord-economy-super'>NPM</a></b></li>
<li><b><a href = 'https://github.com/shadowplay1/discord-economy-super'>GitHub</a></b></li>
<li><b><a href = 'https://github.com/shadowplay1/discord-economy-super/tree/main/examples'>Bot Examples</a></b></li>
<li><b><a href = 'https://discord.gg/4pWKq8vUnb'>Discord Server</a></b></li>
</ul>
<b>If you found a bug, have any questions or need help, join the <a href = 'https://discord.gg/4pWKq8vUnb'>Support Server</a>.</b>
<br>
<b>Module Created by ShadowPlay.</b>

# ❤️ Thanks for using Discord Economy Super ❤️
