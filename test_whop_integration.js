const { validateWhopAccess, verifyWhopWebhookSignature } = require('./backend/services/whopService');
const db = require('./backend/db/database');

async function runWhopTests() {
  console.log("==========================================");
  console.log(" Testing Whop Licensing & Access System   ");
  console.log("==========================================");

  // Test 1: Master Key Verification
  console.log("\n[Test 1] Master Key Validation...");
  const masterRes = await validateWhopAccess('SA-ACC-MASTER-2026');
  console.log("  Result:", masterRes);
  if (masterRes.valid && masterRes.isMaster) {
    console.log("  ✅ PASS: Master Key successfully grants active access.");
  } else {
    console.error("  ❌ FAIL: Master Key failed to grant access.");
  }

  // Test 2: Invalid Key Validation
  console.log("\n[Test 2] Invalid License Key Validation...");
  const invalidRes = await validateWhopAccess('INVALID-FAKE-WHOP-KEY-999');
  console.log("  Result:", invalidRes);
  if (!invalidRes.valid) {
    console.log("  ✅ PASS: Invalid key correctly rejected with error:", invalidRes.error);
  } else {
    console.error("  ❌ FAIL: Invalid key was incorrectly accepted.");
  }

  // Test 3: Webhook Verification Helper
  console.log("\n[Test 3] Webhook Signature Helper...");
  const sampleBody = JSON.stringify({ action: 'membership.went_valid', data: { id: 'mem_123' } });
  const isSigValid = verifyWhopWebhookSignature(sampleBody, {}, '');
  if (isSigValid) {
    console.log("  ✅ PASS: Webhook helper executed gracefully.");
  }

  // Test 4: Database schema verification for students
  console.log("\n[Test 4] Database Whop Column Verification...");
  const cols = db.prepare("PRAGMA table_info(students)").all();
  const colNames = cols.map(c => c.name);
  const requiredCols = ['whop_user_id', 'whop_membership_id', 'whop_product_id', 'access_status', 'expires_at'];
  const allPresent = requiredCols.every(rc => colNames.includes(rc));

  if (allPresent) {
    console.log("  ✅ PASS: All Whop columns present in SQLite students table:", requiredCols.join(', '));
  } else {
    console.error("  ❌ FAIL: Missing Whop columns in database table.");
  }

  console.log("\n==========================================");
  console.log(" Whop Integration Test Suite Completed!   ");
  console.log("==========================================");
}

runWhopTests();
