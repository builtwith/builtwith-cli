'use strict';

const { requireKey } = require('../config');
const { request } = require('../client');
const { InputError } = require('../errors');
const output = require('../output');
const ora = require('ora');

module.exports = function registerDomain(program) {
  const domain = program.command('domain').description('Domain technology lookup');

  domain
    .command('lookup <domain>')
    .description('Look up technologies used by a domain')
    .option('--nopii', 'Exclude PII data')
    .option('--nometa', 'Exclude meta data')
    .option('--noattr', 'Exclude attribution data')
    .option('--liveonly', 'Only return currently-live technologies')
    .option('--fdrange <YYYYMMDD-YYYYMMDD>', 'First-detected date range')
    .option('--ldrange <YYYYMMDD-YYYYMMDD>', 'Last-detected date range')
    .action(async (domainArg, cmdOpts) => {
      const opts = program.opts();
      if (opts.noColor) output.setNoColor(true);
      if (!domainArg) throw new InputError('Domain argument is required');
      const key = requireKey(opts.key);

      const params = { KEY: key, LOOKUP: domainArg };
      // Boolean flags: true → '' so URL gets ?NOPII= which BuiltWith treats as present
      if (cmdOpts.nopii)   params.NOPII   = true;
      if (cmdOpts.nometa)  params.NOMETA  = true;
      if (cmdOpts.noattr)  params.NOATTR  = true;
      if (cmdOpts.liveonly) params.LIVEONLY = true;
      if (cmdOpts.fdrange) params.FDRANGE = cmdOpts.fdrange;
      if (cmdOpts.ldrange) params.LDRANGE = cmdOpts.ldrange;

      const spinner = opts.quiet ? null : ora({ text: `Looking up ${domainArg}...`, stream: process.stderr }).start();
      try {
        const data = await request('domain', params, { dryRun: opts.dryRun, debug: opts.debug, spinner });
        output.print(data, { format: opts.format });
      } catch (err) {
        if (spinner) spinner.stop();
        throw err;
      }
    });
};
