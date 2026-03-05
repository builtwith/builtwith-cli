'use strict';

const { requireKey } = require('../config');
const { request } = require('../client');
const output = require('../output');
const ora = require('ora');

module.exports = function registerLists(program) {
  const lists = program.command('lists').description('Technology lists');

  lists
    .command('tech <tech>')
    .description('Get list of sites using a technology')
    .option('--offset <n>', 'Result offset', '0')
    .option('--limit <n>', 'Max results', '20')
    .action(async (tech, cmdOpts) => {
      const opts = program.opts();
      if (opts.noColor) output.setNoColor(true);
      const key = requireKey(opts.key);
      const params = { KEY: key, TECH: tech, OFFSET: cmdOpts.offset, LIMIT: cmdOpts.limit };
      const spinner = opts.quiet ? null : ora({ text: `Fetching list for ${tech}...`, stream: process.stderr }).start();
      try {
        const data = await request('lists', params, { dryRun: opts.dryRun, debug: opts.debug, spinner });
        output.print(data, { format: opts.format });
      } catch (err) {
        if (spinner) spinner.stop();
        throw err;
      }
    });
};
