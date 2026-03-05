'use strict';

const { requireKey } = require('../config');
const { request } = require('../client');
const output = require('../output');
const ora = require('ora');

module.exports = function registerCompany(program) {
  const company = program.command('company').description('Company to URL lookup');

  company
    .command('find <name>')
    .description('Find domains associated with a company name')
    .action(async (name) => {
      const opts = program.opts();
      if (opts.noColor) output.setNoColor(true);
      const key = requireKey(opts.key);
      const params = { KEY: key, COMPANY: name };
      const spinner = opts.quiet ? null : ora({ text: `Finding company "${name}"...`, stream: process.stderr }).start();
      try {
        const data = await request('company', params, { dryRun: opts.dryRun, debug: opts.debug, spinner });
        output.print(data, { format: opts.format });
      } catch (err) {
        if (spinner) spinner.stop();
        throw err;
      }
    });
};
