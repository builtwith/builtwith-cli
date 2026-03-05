'use strict';

const { requireKey } = require('../config');
const { request } = require('../client');
const output = require('../output');
const ora = require('ora');

module.exports = function registerProducts(program) {
  const products = program.command('products').description('Ecommerce product search');

  products
    .command('search <query>')
    .description('Search for ecommerce products')
    .option('--page <n>', 'Page number', '1')
    .option('--limit <n>', 'Results per page', '20')
    .action(async (query, cmdOpts) => {
      const opts = program.opts();
      if (opts.noColor) output.setNoColor(true);
      const key = requireKey(opts.key);
      const params = { KEY: key, QUERY: query, PAGE: cmdOpts.page, LIMIT: cmdOpts.limit };
      const spinner = opts.quiet ? null : ora({ text: `Searching products for "${query}"...`, stream: process.stderr }).start();
      try {
        const data = await request('products', params, { dryRun: opts.dryRun, debug: opts.debug, spinner });
        output.print(data, { format: opts.format });
      } catch (err) {
        if (spinner) spinner.stop();
        throw err;
      }
    });
};
