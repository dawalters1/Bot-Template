
const WOLF = require('@dawalters1/wolf.js');
const bot = new WOLF.WOLFBot();

const help = require('./src/help');
const example = require('./src/example');
const capabilityExample = require('./src/capabilityExample');

const keyword = bot.config.keyword;

bot.on.ready(async () => {
  console.log('ready');
});

bot.commandHandler.register([
  new WOLF.Command(`${keyword}_command_${keyword}`, { group:  (command) => bot.messaging().sendGroupMessage(command.targetGroupId, bot.phrase().getByLanguageAndName(command.language, `${bot.config.keyword}_help_message`)) },
    [
      new WOLF.Command(`${keyword}_command_help`, { group: (command) => bot.messaging().sendGroupMessage(command.targetGroupId, bot.phrase().getByLanguageAndName(command.language, `${bot.config.keyword}_help_message`)) }),
      new WOLF.Command(`${keyword}_command_example`, { group: (command) => example(bot, command) }),
      new WOLF.Command(`${keyword}_command_capability`, { group: (command) => capabilityExample(bot, command) })
    ])
]);

bot.login();