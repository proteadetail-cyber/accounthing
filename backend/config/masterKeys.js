const DEFAULT_MASTER_KEY = 'Amaya@1Sage';

function getMasterKeys() {
  const configuredKeys = [
    process.env.MASTER_KEY || DEFAULT_MASTER_KEY,
    ...(process.env.MASTER_KEYS || '').split(',')
  ]
    .filter((key) => typeof key === 'string' && key.trim())
    .map((key) => key.trim());

  return new Set(configuredKeys);
}

function isMasterKey(key) {
  return typeof key === 'string' && getMasterKeys().has(key.trim());
}

module.exports = { isMasterKey };
