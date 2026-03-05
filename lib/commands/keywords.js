'use strict';

const { requireKey } = require('../config');
const { request } = require('../client');
const output = require('../output');
const ora = require('ora');

module.exports = function registerKeywords(program) {
  const kw = program.command('keywords').description('Keyword data lookup');

  kw
    .command('lookup <domain>')
    .description('Get keyword data for a domain')
    .action(async (domainArg) => {
      const opts = program.opts();
      if (opts.noColor) output.setNoColor(true);
      const key = requireKey(opts.key);
      const params = { KEY: key, LOOKUP: domainArg };
      const spinner = opts.quiet ? null : ora({ text: `Fetching keywords for ${domainArg}...`, stream: process.stderr }).start();
      try {
        const data = await request('keywords', params, { dryRun: opts.dryRun, debug: opts.debug, spinner });
        output.print(data, { format: opts.format });
      } catch (err) {
        if (spinner) spinner.stop();
        throw err;
      }
    });
};
