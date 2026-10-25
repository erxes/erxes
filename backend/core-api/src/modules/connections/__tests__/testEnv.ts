/**
 * Imported first by the integration suite, before any platform module reads
 * its environment. Every database is a throwaway one named after this run;
 * SaaS mode gives each tenant its own database, so isolation is real.
 */
const run = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const base =
  process.env.CONNECTIONS_TEST_MONGO_URL || 'mongodb://127.0.0.1:27017';

export const TEST_DB_PREFIX = `erxes_conn_test_${run}`;
export const TEST_MONGO_BASE = base;

process.env.VERSION = 'saas';
process.env.NODE_ENV = 'development';
process.env.MONGO_URL = `${base}/${TEST_DB_PREFIX}_main`;
process.env.CORE_MONGO_URL = `${base}/${TEST_DB_PREFIX}_core`;
process.env.DB_NAME = `${TEST_DB_PREFIX}_<organizationId>`;
process.env.ENABLED_PLUGINS = 'ai,sales';
process.env.JWT_TOKEN_SECRET = 'connections-test-secret';
delete process.env.LOAD_BALANCER_ADDRESS;
