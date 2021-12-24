
const WOLF = require('wolf.js');
const api = new WOLF.WOLFBot();

const help = require('./src/help');
const { group, subscriber } = require('./src/get');
const join = require('./src/join');
const leave = require('./src/leave');

const keyword = api.config.keyword;

api.commandHandler().register([
  // Base Command 1
  new WOLF.Command(`${keyword}_command_${keyword}`, { both: (command) => help(api, command, 'default') },
    [
      new WOLF.Command(`${keyword}_command_help`, { both: (command) => help(api, command) }),
      new WOLF.Command(`${keyword}_command_get`, { group: (command) => help(api, command) },
        [
          new WOLF.Command(`${keyword}_command_group`, { group: (command) => group(api, command) }),
          new WOLF.Command(`${keyword}_command_subscriber`, { group: (command) => subscriber(api, command) })
        ]),
      new WOLF.Command(`${keyword}_command_join`, { both: (command) => join(api, command) }),
      new WOLF.Command(`${keyword}_command_leave`, { both: (command) => leave(api, command) })
    ]
  ),

  // Base Command 2 - Example !blackjack
  new WOLF.Command(`${keyword}_command_blackjack`, { both: (command) => help(api, command, 'blackjack') },
    [
    // Add blackjack commands here
    ]),

  // Base Command 3 - Example !roulette
  new WOLF.Command(`${keyword}_command_roulette`, { both: (command) => help(api, command, 'roulette') },
    [
    // Add roulette commands here
    ])
]);

api.on('ready', () => console.log('Ready'));

api.on('privateMessage', async (message) => {
  if (message.isCommand) {
    return Promise.resolve();
  }

  message.language = (await api.subscriber().getById(message.sourceSubscriberId)).language;
  return await help(api, message);
});

api.login('email', 'password');
