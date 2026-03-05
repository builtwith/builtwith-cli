'use strict';

const { requireKey } = require('../config');
const { request } = require('../client');
const output = require('../output');
const ora = require('ora');

module.exports = function registerTrends(program) {
  const trends = program.command('trends').description('Technology trend data');

  trends
    .command('tech <tech>')
    .description('Get trend data for a technology')
    .action(async (tech) => {
      const opts = program.opts();
      if (opts.noColor) output.setNoColor(true);
      const key = requireKey(opts.key);
      const params = { KEY: key, TECH: tech };
      const spinner = opts.quiet ? null : ora({ text: `Fetching trends for ${tech}...`, stream: process.stderr }).start();
      try {
        const data = await request('trends', params, { dryRun: opts.dryRun, debug: opts.debug, spinner });
        output.print(data, { format: opts.format });
      } catch (err) {
        if (spinner) spinner.stop();
        throw err;
      }
    });
};
