'use strict';

const { requireKey } = require('../config');
const { request } = require('../client');
const output = require('../output');
const ora = require('ora');

module.exports = function registerFree(program) {
  const free = program.command('free').description('Free API lookup');

  free
    .command('lookup <domain>')
    .description('Free category/group counts for a domain')
    .action(async (domainArg) => {
      const opts = program.opts();
      if (opts.noColor) output.setNoColor(true);
      const key = requireKey(opts.key);
      const params = { KEY: key, LOOKUP: domainArg };
      const spinner = opts.quiet ? null : ora({ text: `Fetching free data for ${domainArg}...`, stream: process.stderr }).start();
      try {
        const data = await request('free', params, { dryRun: opts.dryRun, debug: opts.debug, spinner });
        output.print(data, { format: opts.format });
      } catch (err) {
        if (spinner) spinner.stop();
        throw err;
      }
    });
};
