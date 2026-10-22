import { createHash, randomBytes } from 'node:crypto';
import { CredentialsError } from './types';

export const validTenant = (tenant: string): boolean =>
  typeof tenant === 'string' && /^[a-z0-9][a-z0-9-]{0,62}$/.test(tenant);

export const hashConsumerToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

export const issueConsumerToken = (tenant: string): string => {
  if (!validTenant(tenant)) throw new CredentialsError();
  return `ecv1.${Buffer.from(tenant).toString('base64url')}.${randomBytes(32).toString('base64url')}`;
};

export const parseConsumerToken = (token: string): { tenant: string; tokenHash: string } => {
  if (typeof token !== 'string' || token.length > 160) throw new CredentialsError('CREDENTIALS_FORBIDDEN');
  const match = /^ecv1\.([A-Za-z0-9_-]{2,84})\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!match) throw new CredentialsError('CREDENTIALS_FORBIDDEN');
  const tenant = Buffer.from(match[1], 'base64url').toString('utf8');
  if (!validTenant(tenant) || Buffer.from(tenant).toString('base64url') !== match[1] ||
      Buffer.from(match[2], 'base64url').toString('base64url') !== match[2]) {
    throw new CredentialsError('CREDENTIALS_FORBIDDEN');
  }
  return { tenant, tokenHash: hashConsumerToken(token) };
};
