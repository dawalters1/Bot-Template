import { WOLF, Command } from 'wolf.js';

import Cache from './src/cache/index.js';
import get from './src/get/index.js'
import help from './src/help/index.js';
import game from './src/game/index.js';
import gameTimeout from './src/timeouts/gameTimeout.js';

const client = new WOLF();
const cache = new Cache();

const keyword = client.config.keyword;

client.commandHandler.register(
  [
    // Base Command 1
    new Command(`${keyword}_command_${keyword}`, { both: command => help(client, command) },
      [
        new Command(`${keyword}_command_help`, { both: command => help(client, command) }),
        new Command(`${keyword}_command_start`, { group: command => game.start(client, command, cache) }),
        new Command(`${keyword}_command_get`, { group: command => help(client, command) },
          [
            new Command(`${keyword}_command_group`, { group: command => get.group(client, command) }),
            new Command(`${keyword}_command_subscriber`, { group: command => get.subscriber(client, command) })
          ]
        ),
        new Command(`${keyword}_command_join`, { both: client.utility.join }),
        new Command(`${keyword}_command_leave`, { both: client.utility.leave })
      ]
    ),

    // Base Command 2 - Example !blackjack
    new Command(`${keyword}_command_example2`, { both: command => help(client, command, 'example2') },
      [
        // Add blackjack commands here
      ]
    ),

    // Base Command 3 - Example !roulette
    new Command(`${keyword}_command_example3`, { both: command => help(client, command, 'example3') },
      [
        // Add roulette commands here
      ]
    )
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

client.on('groupMessage', async message => {
  if (message.isCommand) {
    return Promise.resolve();
  }

  const timestamp = Date.now();

  const unlock = await cache.lock(message.targetGroupId);
  try {

    const cached = await cache.getGame(message.targetGroupId);

    if (!cached) {
      return Promise.resolve();
    }

    return await game.onGroupMessage(client, message, cached, timestamp, cache)
  }
  finally {
    unlock();
  }
})

client.on('privateMessage', async (message) => {
  if (message.isCommand) {
    return Promise.resolve();
  }

  message.language = (await message.subscriber()).language;

  return await help(client, message);
});

client.login();
