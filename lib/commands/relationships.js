'use strict';

const { requireKey } = require('../config');
const { request } = require('../client');
const output = require('../output');
const ora = require('ora');

module.exports = function registerRelationships(program) {
  const rel = program.command('relationships').description('Domain relationship data');

  rel
    .command('lookup <domain>')
    .description('Look up domains related to a given domain')
    .action(async (domainArg) => {
      const opts = program.opts();
      if (opts.noColor) output.setNoColor(true);
      const key = requireKey(opts.key);
      const params = { KEY: key, LOOKUP: domainArg };
      const spinner = opts.quiet ? null : ora({ text: `Fetching relationships for ${domainArg}...`, stream: process.stderr }).start();
      try {
        const data = await request('relationships', params, { dryRun: opts.dryRun, debug: opts.debug, spinner });
        output.print(data, { format: opts.format });
      } catch (err) {
        if (spinner) spinner.stop();
        throw err;
      }
    });
};
