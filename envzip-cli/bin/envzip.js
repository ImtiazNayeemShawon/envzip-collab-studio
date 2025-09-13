#!/usr/bin/env node

const { Command } = require('commander');
const EnvZipCLI = require('../src/cli');

const program = new Command();
const cli = new EnvZipCLI();

program
  .name('envzip')
  .description('Hybrid .env syncing system with Appwrite')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize envzip configuration')
  .action(async () => {
    await cli.init();
  });

program
  .command('pull')
  .description('Pull latest environment variables from Appwrite')
  .action(async () => {
    await cli.pull();
  });

program
  .command('push')
  .description('Push local .env changes to Appwrite')
  .action(async () => {
    await cli.push();
  });

program
  .command('watch')
  .description('Watch for changes and sync automatically')
  .option('-d, --dashboard', 'Enable realtime dashboard sync')
  .action(async (options) => {
    await cli.watch(options.dashboard);
  });

program
  .command('status')
  .description('Show sync status and configuration')
  .action(async () => {
    await cli.status();
  });

program.parse();
