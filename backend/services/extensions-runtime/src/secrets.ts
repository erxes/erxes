import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { z } from 'zod';
import type { IModels } from './connectionResolver';
import { ApiError } from './errors';
import { LIMITS } from './limits';

// Secret values are encrypted with AES-256-GCM under EXT_SECRETS_KEY (base64,
// 32 bytes). Without a valid key the runtime still starts: the secret routes
// answer SECRETS_DISABLED and calls get no secrets.
const KEY = (() => {
  const raw = process.env.EXT_SECRETS_KEY;

  if (!raw) {
    return undefined;
  }

  const key = Buffer.from(raw, 'base64');

  if (key.length !== 32) {
    console.error('EXT_SECRETS_KEY is not 32 bytes of base64; secrets are off');
    return undefined;
  }

  return key;
})();

const disabled = () =>
  new ApiError(
    503,
    'SECRETS_DISABLED',
    'Extension secrets are off on this server: EXT_SECRETS_KEY is not set',
  );

// The id doubles as the cipher's additional data, so a stored value can't be
// copied to another tenant, extension or name and still decrypt.
const secretId = (tenant: string, extId: string, name: string) =>
  `${tenant}:${extId}:${name}`;

const encrypt = (key: Buffer, id: string, value: string) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv).setAAD(Buffer.from(id));
  const ciphertext = Buffer.concat([
    cipher.update(value, 'utf8'),
    cipher.final(),
  ]);

  return {
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  };
};

const decrypt = (
  key: Buffer,
  doc: { _id: string; iv: string; tag: string; ciphertext: string },
) => {
  const decipher = createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(doc.iv, 'base64'),
  )
    .setAAD(Buffer.from(doc._id))
    .setAuthTag(Buffer.from(doc.tag, 'base64'));

  return Buffer.concat([
    decipher.update(Buffer.from(doc.ciphertext, 'base64')),
    decipher.final(),
  ]).toString('utf8');
};

// The install's declared secrets, or 404 when it isn't installed.
const declaredSecrets = async (
  models: IModels,
  tenant: string,
  extId: string,
) => {
  const ext = await models.Extensions.findById(`${tenant}:${extId}`)
    .select('secrets')
    .lean();

  if (!ext) {
    throw new ApiError(404, 'NOT_INSTALLED', 'Extension is not installed');
  }

  return ext.secrets ?? {};
};

// Names and descriptions the install declares, and whether each is set.
// Never values.
export const listSecrets = async (
  models: IModels,
  tenant: string,
  extId: string,
) => {
  if (!KEY) {
    throw disabled();
  }

  const declared = await declaredSecrets(models, tenant, extId);
  const stored = await models.ExtensionSecrets.find({
    subdomain: tenant,
    extId,
  })
    .select('name updatedAt')
    .lean();

  return Object.entries(declared).map(([name, description]) => {
    const doc = stored.find((s) => s.name === name);
    return {
      name,
      description,
      set: !!doc,
      updatedAt: doc?.updatedAt ?? null,
    };
  });
};

export const SecretValue = z.object({
  value: z.string().min(1).max(LIMITS.secretValueChars),
});

export const setSecret = async (
  models: IModels,
  tenant: string,
  extId: string,
  name: string,
  value: string,
) => {
  if (!KEY) {
    throw disabled();
  }

  if (!(name in (await declaredSecrets(models, tenant, extId)))) {
    throw new ApiError(
      404,
      'UNKNOWN_SECRET',
      `${extId} doesn't declare a secret ${name}`,
    );
  }

  const _id = secretId(tenant, extId, name);

  await models.ExtensionSecrets.updateOne(
    { _id },
    {
      $set: {
        subdomain: tenant,
        extId,
        name,
        ...encrypt(KEY, _id, value),
        updatedAt: new Date(),
      },
    },
    { upsert: true },
  );
};

export const deleteSecret = async (
  models: IModels,
  tenant: string,
  extId: string,
  name: string,
) => {
  if (!KEY) {
    throw disabled();
  }

  await declaredSecrets(models, tenant, extId);
  await models.ExtensionSecrets.deleteOne({
    _id: secretId(tenant, extId, name),
  });
};

// The declared secrets that are set, decrypted, for one call. A value that
// no longer decrypts (the key changed) is left unset, and its value is never
// logged.
export const loadSecrets = async (
  models: IModels,
  tenant: string,
  extId: string,
  names: string[],
) => {
  if (!KEY || names.length === 0) {
    return {};
  }

  const docs = await models.ExtensionSecrets.find({
    subdomain: tenant,
    extId,
    name: { $in: names },
  }).lean();
  const secrets: Record<string, string> = {};

  for (const doc of docs) {
    try {
      secrets[doc.name] = decrypt(KEY, doc);
    } catch {
      console.error(`secret ${doc._id} doesn't decrypt with EXT_SECRETS_KEY`);
    }
  }

  return secrets;
};

// An extension's error message may quote a secret it was given. Replace
// every value before the message reaches the caller or run history.
export const redact = (message: string, secrets: Record<string, string>) =>
  Object.values(secrets).reduce(
    (text, value) => text.split(value).join('[secret]'),
    message,
  );
