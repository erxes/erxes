/**
 * Imported first by mutationPermissions.test.ts so every store points at a
 * throwaway or unreachable target before any module reads its configuration
 * (MONGO_URL is read when the shared library loads).
 */
import { randomBytes } from 'crypto';

export const DB_NAME = `erxes_permission_test_${process.pid}_${randomBytes(
  4,
).toString('hex')}`;

export const MONGO_BASE = (
  process.env.PERMISSION_TEST_MONGO_URL || 'mongodb://127.0.0.1:27017'
).replace(/\/+$/, '');

export const throwawayMongoUrl = (dbName: string) =>
  `${MONGO_BASE}/${dbName}?directConnection=true`;

process.env.MONGO_URL = throwawayMongoUrl(DB_NAME);

// No cloud or mail credentials can be picked up from the environment.
for (const key of Object.keys(process.env)) {
  if (
    /^(AWS_|SENDGRID|CLOUDFLARE|GOOGLE_|AZURE|FIREBASE|SMTP|MAIL_)/.test(key)
  ) {
    delete process.env[key];
  }
}
process.env.AWS_SHARED_CREDENTIALS_FILE = '/dev/null';
process.env.AWS_CONFIG_FILE = '/dev/null';
process.env.AWS_EC2_METADATA_DISABLED = 'true';
delete process.env.VERSION;
