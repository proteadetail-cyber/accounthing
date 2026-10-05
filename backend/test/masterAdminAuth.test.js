const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const authRoutes = require('../routes/authRoutes');

test('admin master endpoint accepts additional keys and rejects invalid keys', async () => {
  const previousMasterKey = process.env.MASTER_KEY;
  const previousMasterKeys = process.env.MASTER_KEYS;
  process.env.MASTER_KEY = 'primary-key';
  process.env.MASTER_KEYS = 'additional-key';

  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  const server = app.listen(0, '127.0.0.1');

  try {
    await new Promise((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });

    const address = server.address();
    const url = `http://127.0.0.1:${address.port}/api/auth/master`;
    const validResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterKey: 'additional-key' })
    });
    assert.equal(validResponse.status, 200);

    const invalidResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterKey: 'invalid-key' })
    });
    assert.equal(invalidResponse.status, 401);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });

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
