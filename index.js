import { WOLF, Command } from 'wolf.js';

import help from './src/help/index.js';
import { group, subscriber } from './src/get/index.js';
import join from './src/join/index.js';
import leave from './src/leave/index.js';

const client = new WOLF();

const keyword = client.config.keyword;

client.commandHandler.register([
  // Base Command 1
  new Command(`${keyword}_command_${keyword}`, { both: (command) => help(client, command) },
    [
      new Command(`${keyword}_command_help`, { both: (command) => help(client, command) }),
      new Command(`${keyword}_command_get`, { group: (command) => help(client, command) },
        [
          new Command(`${keyword}_command_group`, { group: (command) => group(client, command) }),
          new Command(`${keyword}_command_subscriber`, { group: (command) => subscriber(client, command) })
        ]),
      new Command(`${keyword}_command_join`, { both: (command) => join(client, command) }),
      new Command(`${keyword}_command_leave`, { both: (command) => leave(client, command) })
    ]
  ),

  // Base Command 2 - Example !blackjack
  new Command(`${keyword}_command_example2`, { both: (command) => help(client, command, 'example2') },
    [
    // Add blackjack commands here
    ]),

  // Base Command 3 - Example !roulette
  new Command(`${keyword}_command_example3`, { both: (command) => help(client, command, 'example3') },
    [
    // Add roulette commands here
    ])
]);

client.on('ready', () => console.log('Ready'));

client.on('privateMessage', async (message) => {
  if (message.isCommand) {
    return Promise.resolve();
  }

  message.language = (await client.subscriber.getById(message.sourceSubscriberId)).language;

  return await help(client, message);
});

client.login();
