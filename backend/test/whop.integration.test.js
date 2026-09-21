const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../db/database');
const {
  validateWhopAccess,
  verifyWhopWebhookSignature
} = require('../services/whopService');

test('rejects a missing Whop license key', async () => {
  const result = await validateWhopAccess('');

  assert.equal(result.valid, false);
  assert.equal(result.status, 'missing_key');
});

test('accepts the configured master key without calling Whop', async () => {
  const result = await validateWhopAccess(process.env.MASTER_KEY || 'SA-ACC-MASTER-2026');

  assert.equal(result.valid, true);
  assert.equal(result.isMaster, true);
});

test('allows webhook requests when no webhook secret is configured', () => {
  assert.equal(verifyWhopWebhookSignature('{}', {}, ''), true);
});

test('rejects a signed webhook with an invalid signature', () => {
  assert.equal(
    verifyWhopWebhookSignature(
      '{}',
      { 'webhook-signature': 't=123,v1=invalid' },
      'whsec_aW52YWxpZA=='
    ),
    false
  );
});

test('contains the required Whop access columns', () => {
  const columns = db.prepare('PRAGMA table_info(students)').all().map(column => column.name);
  const requiredColumns = [
    'whop_user_id',
    'whop_membership_id',
    'whop_product_id',
    'access_status',
    'expires_at'
  ];

  for (const column of requiredColumns) {
    assert.ok(columns.includes(column), `Missing students.${column}`);
  }
});
