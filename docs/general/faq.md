# Discord Economy Super

[![Downloads](https://img.shields.io/npm/dt/discord-economy-super?style=for-the-badge)](https://www.npmjs.com/package/discord-economy-super)
[![Stable Version](https://img.shields.io/npm/v/discord-economy-super?style=for-the-badge)](https://www.npmjs.com/package/discord-economy-super)

<b>Discord Economy Super</b> - Easy and customizable economy framework for your [Discord Bot](https://discord.js.org/#/).

## ❓ | Frequently Asked Questions

### Q: Will the module support MongoDB?
#### A: No. At the moment, we cant do support for MongoDB in the module. Sorry about that.
<br>

### Q: Why do I get a "Cannot read property '(any manager property or method)' of null"?
#### A: Because the module is not started and not ready yet. Use this code to fix this problem:
```js
const Economy = require('discord-economy-super')
const economy = new Economy(options)

economy.on('ready', () => {
    <client>.economy = economy
})
```
It will add the module in your bot client's property and you could use it in any command without any errors. For example: `<client>.economy.balance.fetch(...)` will return you a user's balance number.
<br>

### Q: Why do I get a "SyntaxError: Unexpected token '.' "?
#### A: Because the module is supporting only Node.js v14.0.0 or above. Earlier versions are not supporting the "?." operator. You need to update Node.js to make the module work.
<br>

### Q: Can I use the module globally?
#### A: Yes! Just use '123' as guild ID or any other value in all methods, and the module will work with only one guild. For example: guild '111' and '222' will take the 333's balance info from guild '123' in database.

```js
// example eco database
{
    "123": {
	    "333": {
		    "money": 1150,
		    "dailyCooldown": 1638034751398,
		    "weeklyCooldown": 1636811771994,
		    "workCooldown": 1636817161065,
		    "inventory": [],
		    "history": []
	    }
    }
}


const userID = '333'

// eco.balance.fetch(guildID, userID)
eco.balance.fetch('123', userID) // 1150; can be used anywhere and it will be the same
eco.balance.fetch('123', userID) // 1150; still the same

eco.balance.fetch('1234', userID) // null; now it WON'T be the same!
```

<br>

### Q: Why are examples not working?
#### A: Examples provided in documentation and in GitHub are for one-file bot. See the questions above to get more info. If it's a bug, see the question below.
<br>

### Q: I found a bug or have an idea. Where I could submit it?
#### A: On our [Support Server](https://discord.gg/4pWKq8vUnb). We appreciate that!
<br>

## ❗ | Useful Links
<ul>
<li><b><a href = "https://www.npmjs.com/package/discord-economy-super">NPM</a></b></li>
<li><b><a href = "https://github.com/shadowplay1/discord-economy-super">GitHub</a></b></li>
<li><b><a href = "https://github.com/shadowplay1/discord-economy-super/tree/main/examples">Bot Examples</a></b></li>
<li><b><a href = "https://discord.gg/4pWKq8vUnb">Discord Server</a></b></li>
</ul>
<b>If you found a bug, have any questions or need help, join the <a href = "https://discord.gg/4pWKq8vUnb">Support Server</a>.</b>
<br>
<b>Module Created by ShadowPlay.</b>

# ❤️ Thanks for using Discord Economy Super ❤️