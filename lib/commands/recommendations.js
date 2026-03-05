'use strict';

const { requireKey } = require('../config');
const { request } = require('../client');
const output = require('../output');
const ora = require('ora');

module.exports = function registerRecommendations(program) {
  const rec = program.command('recommendations').description('Technology recommendations');

  rec
    .command('lookup <domain>')
    .description('Get technology recommendations for a domain')
    .action(async (domainArg) => {
      const opts = program.opts();
      if (opts.noColor) output.setNoColor(true);
      const key = requireKey(opts.key);
      const params = { KEY: key, LOOKUP: domainArg };
      const spinner = opts.quiet ? null : ora({ text: `Fetching recommendations for ${domainArg}...`, stream: process.stderr }).start();
      try {
        const data = await request('recommendations', params, { dryRun: opts.dryRun, debug: opts.debug, spinner });
        output.print(data, { format: opts.format });
      } catch (err) {
        if (spinner) spinner.stop();
        throw err;
      }
    });
};
