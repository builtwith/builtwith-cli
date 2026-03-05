'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { ConfigError } = require('./errors');

// Load .env silently from CWD
try {
  require('dotenv').config({ path: path.join(process.cwd(), '.env'), quiet: true });
} catch (_) {}

function loadRcFile(dir) {
  const rcPath = path.join(dir, '.builtwithrc');
  try {
    const raw = fs.readFileSync(rcPath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed.key || null;
  } catch (_) {
    return null;
  }
}

/**
 * Resolve API key using priority order:
 * 1. --key CLI flag
 * 2. BUILTWITH_API_KEY env var
 * 3. .builtwithrc in CWD
 * 4. .builtwithrc in home dir
 */
function resolveKey(flagValue) {
  if (flagValue) return flagValue;
  if (process.env.BUILTWITH_API_KEY) return process.env.BUILTWITH_API_KEY;
  const cwdKey = loadRcFile(process.cwd());
  if (cwdKey) return cwdKey;
  const homeKey = loadRcFile(os.homedir());
  if (homeKey) return homeKey;
  return null;
}

function requireKey(flagValue) {
  const key = resolveKey(flagValue);
  if (!key) {
    throw new ConfigError(
      'No API key found. Provide via --key, BUILTWITH_API_KEY env var, or .builtwithrc file.'
    );
  }
  return key;
}

module.exports = { resolveKey, requireKey };
