'use strict';

const { Command } = require('commander');
const { requireKey } = require('../config');
const { request } = require('../client');
const output = require('../output');
const ora = require('ora');

module.exports = function registerAccount(program) {
  const account = program.command('account').description('Account information');

  account
    .command('whoami')
    .description('Show account identity')
    .action(async () => {
      const opts = program.opts();
      if (opts.noColor) output.setNoColor(true);
      const key = requireKey(opts.key);
      const spinner = opts.quiet ? null : ora({ text: 'Fetching account...', stream: process.stderr }).start();
      try {
        const data = await request('whoami', { KEY: key }, { dryRun: opts.dryRun, debug: opts.debug, spinner });
        output.print(data, { format: opts.format });
      } catch (err) {
        if (spinner) spinner.stop();
        throw err;
      }
    });

  account
    .command('usage')
    .description('Show API usage')
    .action(async () => {
      const opts = program.opts();
      if (opts.noColor) output.setNoColor(true);
      const key = requireKey(opts.key);
      const spinner = opts.quiet ? null : ora({ text: 'Fetching usage...', stream: process.stderr }).start();
      try {
        const data = await request('usage', { KEY: key }, { dryRun: opts.dryRun, debug: opts.debug, spinner });
        output.print(data, { format: opts.format });
      } catch (err) {
        if (spinner) spinner.stop();
        throw err;
      }
    });
};
