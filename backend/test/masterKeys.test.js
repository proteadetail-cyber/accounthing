const test = require('node:test');
const assert = require('node:assert/strict');
const { isMasterKey } = require('../config/masterKeys');

test('accepts the primary master key and comma-separated additional keys', () => {
  const previousMasterKey = process.env.MASTER_KEY;
  const previousMasterKeys = process.env.MASTER_KEYS;
  process.env.MASTER_KEY = 'primary-key';
  process.env.MASTER_KEYS = ' additional-one, ,additional-two ';

  try {
    assert.equal(isMasterKey('primary-key'), true);
    assert.equal(isMasterKey('additional-one'), true);
    assert.equal(isMasterKey(' additional-two '), true);
    assert.equal(isMasterKey('not-a-key'), false);
    assert.equal(isMasterKey(undefined), false);
  } finally {
    if (previousMasterKey === undefined) {
      delete process.env.MASTER_KEY;
    } else {
      process.env.MASTER_KEY = previousMasterKey;
    }

    if (previousMasterKeys === undefined) {
      delete process.env.MASTER_KEYS;
    } else {
      process.env.MASTER_KEYS = previousMasterKeys;
    }
  }
});
