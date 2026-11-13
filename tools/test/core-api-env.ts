import { generateKeyPairSync, randomBytes } from 'node:crypto';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');

/** The settings core-api's tests run with (vite.config.ts, the core-api project). */
export const coreApiTestEnv = {
  CORE_TEST_TEMPLATE: `core_test_template_${randomBytes(4).toString('hex')}`,
  // A plugin key for the plugin-only endpoints (notifications, activities).
  CORE_PLUGIN_KEYS: 'hr:test-hr-plugin-key-0123456789abcdefghijklmnop',
  FILES_STORAGE: 'local',
  FILES_LOCAL_DIR: resolve(root, 'apps/core-api/.test-files'),
  FILES_MAX_SIZE_MB: '5',
  // Low lines, so tests reach them quickly.
  MASS_DELETE_ALERT: '20',
  MASS_DELETE_LIMIT: '40',
  FAILED_SIGN_IN_ALERT: '3',
  // One key for the whole run, so parallel files never race to write a key file.
  CORE_SIGNING_KEY: generateKeyPairSync('ec', { namedCurve: 'P-256' }).privateKey.export({
    format: 'pem',
    type: 'pkcs8',
  }),
  // logging.test.ts logs to its own destination.
  LOG_LEVEL: 'silent',
};
