
const WOLF = require('@dawalters1/wolf.js');
const bot = new WOLF.WOLFBot();

const help = require('./src/help');
const example = require('./src/example');
const capabilityExample = require('./src/groupCapability');
const getArguments = require('./src/arguments');

const keyword = bot.config.keyword;

bot.commandHandler.register([
  new WOLF.Command(`${keyword}_command_${keyword}`, { both:  (command) => help(api, command) },
    [
      new WOLF.Command(`${keyword}_command_help`, { both: (command) => help(api, command) }),
      new WOLF.Command(`${keyword}_command_example`, { group: (command) => example(bot, command) }),
      new WOLF.Command(`${keyword}_command_capability`, { group: (command) => capabilityExample(bot, command) }),
      new WOLF.Command(`${keyword}_command_arguments`, { group: (command) => getArguments(bot, command) })
    ])
]);

bot.on.ready(async () =>  console.log('ready'));

bot.login('email', 'password');