import { WOLF, Command } from 'wolf.js';
import TemplateSDK from './src/TemplateSDK/TemplateSDK.js';

import Cache from './src/cache/index.js';
import get from './src/get/index.js'
import help from './src/help/index.js';
import game from './src/game/index.js';
import gameTimeout from './src/timeouts/gameTimeout.js';

const client = new WOLF();
const cache = new Cache();
const templateSDK = new TemplateSDK();

const keyword = client.config.keyword;

client.commandHandler.register(
  [
    new Command(`${keyword}_command_${keyword}`, { both: command => help(client, command) },
      [
        new Command(`${keyword}_command_help`, { both: command => help(client, command) }),
        new Command(`${keyword}_command_start`, { channel: command => game.start(client, command, templateSDK, cache) }),
        new Command(`${keyword}_command_get`, { channel: command => help(client, command) },
          [
            new Command(`${keyword}_command_group`, { channel: command => get.channel(client, command) }),
            new Command(`${keyword}_command_subscriber`, { channel: command => get.subscriber(client, command) })
          ]
        ),
        new Command(`${keyword}_command_join`, { both: client.utility.join }),
        new Command(`${keyword}_command_leave`, { both: client.utility.leave })
      ]
    ),

    // You can add additional command to this array for different base commands
  ]
);

client.on('ready', () => {

  client.utility.timer.register(
    {
      gameTimeout: (data) => gameTimeout(client, data, cache)
    }
  )

  console.log('Ready')
});

client.on('channelMessage', async message => {
  if (message.isCommand) { return false; }

  const timestamp = Date.now();

  const unlock = await cache.lock(message.targetChannelId);
  try {

    const cached = await cache.getGame(message.targetChannelId);

    if (!cached || cached.startedAt < Date.now()) { return false; }

    return await game.onChannelMessage(client, message, cached, timestamp, cache)
  }
  finally {
    unlock();
  }
})

client.on('privateMessage', async (message) => {
  if (message.isCommand) { return false; }

  message.language = (await message.subscriber()).language;

  return await help(client, message);
});

client.login();
