import { type Db, newId, requestOrgId, secrets, withSystem } from '@erxes/core-db';
import { and, asc, eq, gt, ne, sql } from 'drizzle-orm';
import { config } from '~/config';
import { notFound } from '~/http/errors';
import { decrypt, deriveKey, encrypt, sha256 } from '~/lib/crypto';
import { repeatWhile } from '~/lib/sequence';
import { logger } from '~/logger';
import { defineSchedule } from '~/modules/jobs/jobs';

const log = logger.child({ component: 'vault' });

export type SecretRow = typeof secrets.$inferSelect;

export type WithSecret<Row> = Row & { secret: SecretRow };

type Identity = Pick<SecretRow, 'id' | 'orgId' | 'owner'>;

const CORE = 'core';
const LEGACY = 'legacy';
const RESEAL_BATCH = 200;
const RESEAL_ROUNDS = 500;

const vaultKey = (secret: string) => {
  const key = deriveKey(secret, 'erxes-core-vault-v1');

  return { id: sha256(key).slice(0, 12), key };
};

const current = vaultKey(config.auth.encryptionKey);

const keys = new Map(
  [current, ...config.auth.retiredEncryptionKeys.map(vaultKey)].map(({ id, key }) => [id, key]),
);

const legacyKeys = [config.auth.encryptionKey, config.auth.jwtSecret].map((secret) =>
  deriveKey(secret, 'erxes-core-secrets-v1'),
);

const boundTo = ({ orgId, id, owner }: Identity) => JSON.stringify([orgId, id, owner]);

const opensWith = (key: Buffer, sealed: string) => {
  try {
    return decrypt(key, sealed, '');
  } catch {
    return null;
  }
};

const openLegacy = (row: SecretRow) => {
  const plain = legacyKeys.map((key) => opensWith(key, row.sealed)).find((value) => value !== null);

  if (plain === undefined)
    throw new Error(`secret ${row.id} opens with none of this server's keys`);

  return plain;
};

export const openSecret = (row: SecretRow) => {
  if (row.keyId === LEGACY) return openLegacy(row);

  const key = keys.get(row.keyId);

  if (!key) throw new Error(`secret ${row.id} is sealed with key ${row.keyId}, which is not set`);

  return decrypt(key, row.sealed, boundTo(row));
};

export const withSecret = <Row>(
  row: Row | null,
  secret: SecretRow | null,
): WithSecret<Row> | null => (row && secret ? { ...row, secret } : null);

const sealFor = (identity: Identity, value: string) => ({
  keyId: current.id,
  sealed: encrypt(current.key, value, boundTo(identity)),
});

export const saveSecretAs = async (tx: Db, owner: string, value: string, id?: string | null) => {
  const identity = { id: id ?? newId(), orgId: requestOrgId(), owner };
  const sealed = sealFor(identity, value);

  if (!id) {
    await tx.insert(secrets).values({ id: identity.id, owner, ...sealed });

    return identity.id;
  }

  const replaced = await tx
    .update(secrets)
    .set({ ...sealed, updatedAt: sql`now()` })
    .where(and(eq(secrets.id, id), eq(secrets.owner, owner)))
    .returning({ id: secrets.id });

  if (!replaced.length) throw notFound('Secret');

  return id;
};

export const readSecretAs = async (tx: Db, owner: string, id: string) => {
  const [row] = await tx
    .select()
    .from(secrets)
    .where(and(eq(secrets.id, id), eq(secrets.owner, owner)))
    .limit(1);

  if (!row) throw notFound('Secret');

  return openSecret(row);
};

export const saveSecret = (tx: Db, value: string, id?: string | null) =>
  saveSecretAs(tx, CORE, value, id);

export const readSecret = (tx: Db, id: string) => readSecretAs(tx, CORE, id);

const resealed = (row: SecretRow) => {
  try {
    return { id: row.id, ...sealFor(row, openSecret(row)) };
  } catch (error) {
    log.error({ err: error, secretId: row.id, keyId: row.keyId }, 'secret could not be re-sealed');

    return null;
  }
};

const resealBatch = (after: string) =>
  withSystem('reseal secrets', async (tx) => {
    const rows = await tx
      .select()
      .from(secrets)
      .where(and(ne(secrets.keyId, current.id), gt(secrets.id, after)))
      .orderBy(asc(secrets.id))
      .limit(RESEAL_BATCH)
      .for('no key update', { skipLocked: true });

    const next = rows.flatMap((row) => resealed(row) ?? []);

    if (next.length) {
      await tx
        .update(secrets)
        .set({ keyId: sql`next.key_id`, sealed: sql`next.sealed`, updatedAt: sql`now()` })
        .from(
          sql`(values ${sql.join(
            next.map((row) => sql`(${row.id}, ${row.keyId}, ${row.sealed})`),
            sql`, `,
          )}) as next (id, key_id, sealed)`,
        )
        .where(sql`${secrets.id} = next.id`);
    }

    return { last: rows.at(-1)?.id, done: next.length, full: rows.length === RESEAL_BATCH };
  });

const resealSecrets = async () => {
  let after = '';
  let done = 0;

  await repeatWhile(RESEAL_ROUNDS, async () => {
    const batch = await resealBatch(after);

    after = batch.last ?? after;
    done += batch.done;

    return batch.full;
  });

  if (done)
    log.info({ secrets: done, keyId: current.id }, 'secrets re-sealed with the current key');
};

export const resealSchedule = defineSchedule({
  queue: 'secrets.reseal',
  cron: '7 * * * *',
  run: resealSecrets,
});
