'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

// Capture stdout writes
function captureStdout(fn) {
  const chunks = [];
  const original = process.stdout.write.bind(process.stdout);
  process.stdout.write = (chunk) => { chunks.push(chunk); return true; };
  try {
    fn();
  } finally {
    process.stdout.write = original;
  }
  return chunks.join('');
}

describe('output - print', () => {
  let output;

  test('prints valid JSON by default', () => {
    delete require.cache[require.resolve('../lib/output')];
    output = require('../lib/output');
    const data = { foo: 'bar', count: 42 };
    const result = captureStdout(() => output.print(data, { format: 'json' }));
    assert.deepEqual(JSON.parse(result), data);
  });

  test('prints array as JSON', () => {
    delete require.cache[require.resolve('../lib/output')];
    output = require('../lib/output');
    const data = [{ a: 1 }, { a: 2 }];
    const result = captureStdout(() => output.print(data, { format: 'json' }));
    assert.deepEqual(JSON.parse(result), data);
  });

  test('prints table format without error', () => {
    delete require.cache[require.resolve('../lib/output')];
    output = require('../lib/output');
    const data = [{ name: 'WordPress', version: '6.0' }];
    const result = captureStdout(() => output.print(data, { format: 'table' }));
    assert.ok(result.includes('WordPress'));
    assert.ok(result.includes('name'));
  });

  test('prints csv format with headers', () => {
    delete require.cache[require.resolve('../lib/output')];
    output = require('../lib/output');
    const data = [{ name: 'WordPress', version: '6.0' }];
    const result = captureStdout(() => output.print(data, { format: 'csv' }));
    assert.ok(result.includes('name'));
    assert.ok(result.includes('WordPress'));
  });

  test('defaults to json format', () => {
    delete require.cache[require.resolve('../lib/output')];
    output = require('../lib/output');
    const data = { x: 1 };
    const result = captureStdout(() => output.print(data, {}));
    assert.deepEqual(JSON.parse(result), data);
  });

  test('handles empty array gracefully in table mode', () => {
    delete require.cache[require.resolve('../lib/output')];
    output = require('../lib/output');
    const result = captureStdout(() => output.print([], { format: 'table' }));
    assert.ok(result.includes('no results'));
  });

  test('handles scalar value', () => {
    delete require.cache[require.resolve('../lib/output')];
    output = require('../lib/output');
    const result = captureStdout(() => output.print(42, { format: 'json' }));
    assert.equal(JSON.parse(result), 42);
  });
});
