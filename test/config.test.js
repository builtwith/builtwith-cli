'use strict';

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const os = require('os');
const path = require('path');
const fs = require('fs');

// We need to test config without side effects from dotenv
// So we require config after clearing env

describe('config - resolveKey', () => {
  let originalKey;

  beforeEach(() => {
    originalKey = process.env.BUILTWITH_API_KEY;
    delete process.env.BUILTWITH_API_KEY;
    // Re-require to get fresh module (clear cache)
    delete require.cache[require.resolve('../lib/config')];
    delete require.cache[require.resolve('../lib/errors')];
  });

  afterEach(() => {
    if (originalKey !== undefined) {
      process.env.BUILTWITH_API_KEY = originalKey;
    } else {
      delete process.env.BUILTWITH_API_KEY;
    }
  });

  test('returns flag value when provided', () => {
    const { resolveKey } = require('../lib/config');
    assert.equal(resolveKey('my-flag-key'), 'my-flag-key');
  });

  test('returns env var when no flag', () => {
    process.env.BUILTWITH_API_KEY = 'env-key-123';
    delete require.cache[require.resolve('../lib/config')];
    const { resolveKey } = require('../lib/config');
    assert.equal(resolveKey(null), 'env-key-123');
  });

  test('returns null when no key sources', () => {
    const { resolveKey } = require('../lib/config');
    assert.equal(resolveKey(null), null);
  });

  test('requireKey throws ConfigError when no key', () => {
    const { requireKey } = require('../lib/config');
    const { ConfigError } = require('../lib/errors');
    assert.throws(() => requireKey(null), ConfigError);
  });

  test('requireKey returns key when provided via flag', () => {
    const { requireKey } = require('../lib/config');
    assert.equal(requireKey('test-key'), 'test-key');
  });

  test('reads key from .builtwithrc file in temp dir', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bw-test-'));
    const rcPath = path.join(tmpDir, '.builtwithrc');
    fs.writeFileSync(rcPath, JSON.stringify({ key: 'rc-file-key' }));

    const originalCwd = process.cwd();
    try {
      process.chdir(tmpDir);
      delete require.cache[require.resolve('../lib/config')];
      const { resolveKey } = require('../lib/config');
      assert.equal(resolveKey(null), 'rc-file-key');
    } finally {
      process.chdir(originalCwd);
      fs.rmSync(tmpDir, { recursive: true });
    }
  });
});
