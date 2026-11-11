import { createPublicKey } from 'node:crypto';
import { z } from 'zod';

const keyId = z.string().min(1).max(128);
const slug = z.string().regex(/^[a-z0-9][a-z0-9_-]{0,62}$/);
const appSchema = z
  .object({
    tenant: slug,
    appId: slug,
    issuer: z.string().url(),
    audience: z.string().min(1).max(255),
    keys: z
      .record(keyId, z.string().min(1))
      .refine((keys) => Object.keys(keys).length > 0),
    direct: z.boolean().default(true),
    group: z.boolean().default(true),
    storage: z
      .object({
        credentialEnv: z
          .string()
          .regex(/^COMMUNICATION_MESSAGING_STORAGE_[A-Z0-9_]+$/),
        bucket: z.string().min(3).max(63),
        region: z.string().min(1),
        endpoint: z
          .string()
          .url()
          .refine((value) => {
            const url = new URL(value);
            return (
              ['http:', 'https:'].includes(url.protocol) &&
              !url.username &&
              !url.password &&
              !url.search &&
              !url.hash
            );
          })
          .optional(),
        maxBytes: z
          .number()
          .int()
          .min(1)
          .max(10 * 1024 * 1024),
        mimeTypes: z
          .array(
            z.enum(['image/png', 'image/jpeg', 'image/gif', 'application/pdf']),
          )
          .min(1),
      })
      .optional(),
    push: z
      .object({
        projectId: z.string().min(1),
        credentialEnv: z
          .string()
          .regex(/^COMMUNICATION_MESSAGING_FCM_[A-Z0-9_]+$/),
        deepLinkBase: z
          .string()
          .url()
          .refine((value) => {
            const url = new URL(value);
            return (
              url.protocol === 'https:' &&
              !url.username &&
              !url.password &&
              !url.search &&
              !url.hash
            );
          }),
      })
      .optional(),
  })
  .strict();

export type MessagingApp = Omit<z.infer<typeof appSchema>, 'keys'> & {
  keys: ReadonlyMap<string, ReturnType<typeof createPublicKey>>;
};

export const parseMessagingApps = (source: string): MessagingApp[] => {
  const parsed = z.array(appSchema).parse(JSON.parse(source));
  const scopes = new Set<string>();
  const audiences = new Set<string>();
  return parsed.map(({ keys, ...app }) => {
    const scope = JSON.stringify([app.tenant, app.appId]);
    const audience = JSON.stringify([app.issuer, app.audience]);
    if (scopes.has(scope) || audiences.has(audience)) {
      throw new Error(
        'Messaging app scopes and issuer/audience pairs must be unique',
      );
    }
    scopes.add(scope);
    audiences.add(audience);
    const publicKeys = new Map(
      Object.entries(keys).map(([id, pem]) => {
        const key = createPublicKey(pem);
        if (
          key.asymmetricKeyType !== 'rsa' ||
          (key.asymmetricKeyDetails?.modulusLength ?? 0) < 2048
        ) {
          throw new Error(
            'Messaging apps require RSA public keys of at least 2048 bits',
          );
        }
        return [id, key] as const;
      }),
    );
    return { ...app, keys: publicKeys };
  });
};

let registry: MessagingApp[] | undefined;

export const getMessagingApps = (): readonly MessagingApp[] => {
  registry ??= parseMessagingApps(
    process.env.COMMUNICATION_MESSAGING_APPS || '[]',
  );
  return registry;
};
