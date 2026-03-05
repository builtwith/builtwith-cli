'use strict';

const { requireKey } = require('../config');
const { request } = require('../client');
const output = require('../output');
const ora = require('ora');

module.exports = function registerTrust(program) {
  const trust = program.command('trust').description('Trust score lookup');

  trust
    .command('lookup <domain>')
    .description('Get trust score for a domain')
    .action(async (domainArg) => {
      const opts = program.opts();
      if (opts.noColor) output.setNoColor(true);
      const key = requireKey(opts.key);
      const params = { KEY: key, LOOKUP: domainArg };
      const spinner = opts.quiet ? null : ora({ text: `Fetching trust score for ${domainArg}...`, stream: process.stderr }).start();
      try {
        const data = await request('trust', params, { dryRun: opts.dryRun, debug: opts.debug, spinner });
        output.print(data, { format: opts.format });
      } catch (err) {
        if (spinner) spinner.stop();
        throw err;
      }
    });
};
