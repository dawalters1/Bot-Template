
const WOLF = require('@dawalters1/wolf.js');
const api = new WOLF.WOLFBot();

const help = require('./src/help');
const example = require('./src/example');
const capabilityExample = require('./src/groupCapability');
const getArguments = require('./src/arguments');

const keyword = api.config.keyword;

api.commandHandler.register([
  new WOLF.Command(`${keyword}_command_${keyword}`, { both:  (command) => help(api, command) },
    [
      new WOLF.Command(`${keyword}_command_help`, { both: (command) => help(api, command) }),
      new WOLF.Command(`${keyword}_command_example`, { group: (command) => example(api, command) }),
      new WOLF.Command(`${keyword}_command_capability`, { group: (command) => capabilityExample(api, command) }),
      new WOLF.Command(`${keyword}_command_arguments`, { group: (command) => getArguments(api, command) })
    ])
]);

api.on.ready(async () =>  console.log('ready'));

api.login('email', 'password');