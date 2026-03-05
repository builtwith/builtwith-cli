'use strict';

const { requireKey } = require('../config');
const { connect } = require('../ws-client');
const { EXIT_CODES } = require('../errors');
const output = require('../output');

module.exports = function registerLive(program) {
  const live = program.command('live').description('Live technology feed');

  live
    .command('feed')
    .description('Stream live technology detection events as NDJSON')
    .option('--duration <seconds>', 'Auto-stop after N seconds')
    .action(async (cmdOpts) => {
      const opts = program.opts();
      if (opts.noColor) output.setNoColor(true);
      const key = requireKey(opts.key);

      let ws;
      let timer;

      function cleanup(exitCode) {
        if (timer) clearTimeout(timer);
        if (ws) ws.close();
        process.exit(exitCode);
      }

      // SIGINT → exit code 8 (INTERRUPTED)
      process.on('SIGINT', () => {
        if (!opts.quiet) output.info('Interrupted');
        cleanup(EXIT_CODES.INTERRUPTED);
      });

      ws = connect(key, {
        debug: opts.debug,
        onMessage(event) {
          // NDJSON: one JSON object per line to stdout
          process.stdout.write(JSON.stringify(event) + '\n');
        },
        onError(err) {
          output.error(err.message);
          cleanup(err.exitCode || EXIT_CODES.NETWORK);
        },
        onClose(code) {
          if (!opts.quiet) output.info(`WebSocket closed (code: ${code})`);
          process.exit(EXIT_CODES.SUCCESS);
        },
      });

      if (cmdOpts.duration) {
        const secs = parseInt(cmdOpts.duration, 10);
        if (!isNaN(secs) && secs > 0) {
          timer = setTimeout(() => {
            if (!opts.quiet) output.info(`Duration ${secs}s elapsed, closing`);
            cleanup(EXIT_CODES.SUCCESS);
          }, secs * 1000);
        }
      }
    });
};
