import { getEnv } from 'erxes-api-shared/utils';
import { readFileSync } from 'fs';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';
import { OAuthClientAccessTokenLifetime } from '@/auth/db/definitions/oauthClientApps';

/**
 * OAuth clients registered once for the whole platform (for example the HR
 * product), valid for every organisation. Configured on core-api, not inside
 * each organisation:
 *
 *   OAUTH_PLATFORM_CLIENTS='[{"clientId":"erxes-hr","name":"HR",
 *     "type":"confidential","secretHash":"<sha256 hex of the secret>",
 *     "redirectUrls":["https://{subdomain}.hr.erxes.io/auth/callback"]}]'
 *
 * `{subdomain}` is replaced by the subdomain the person signs in on, so a code
 * for one organisation can only be sent to that organisation's address.
 */
const platformClientSchema = z.object({
  clientId: z.string().min(1).max(200),
  name: z.string().min(1).max(200),
  type: z.enum(['public', 'confidential']),
  secretHash: z
    .string()
    .regex(/^[0-9a-f]{64}$/, 'secretHash must be the sha256 hex of the secret')
    .optional(),
  redirectUrls: z.array(z.string().min(1)).min(1),
});

export interface ResolvedOAuthClient {
  clientId: string;
  name: string;
  type: 'public' | 'confidential';
  secretHash?: string;
  accessTokenLifetime?: OAuthClientAccessTokenLifetime;
  /** Exact redirect URLs for this organisation (placeholders filled in). */
  redirectUrls: string[];
  platform: boolean;
}

let platformClients: z.infer<typeof platformClientSchema>[] | null = null;

const readPlatformClients = () => {
  if (platformClients) {
    return platformClients;
  }

  const file = getEnv({ name: 'OAUTH_PLATFORM_CLIENTS_FILE' });
  const raw = file
    ? readFileSync(file, 'utf8')
    : getEnv({ name: 'OAUTH_PLATFORM_CLIENTS' });

  platformClients = raw
    ? z.array(platformClientSchema).parse(JSON.parse(raw))
    : [];

  return platformClients;
};

/** For tests: forget the parsed clients so env changes apply. */
export const resetPlatformClients = () => {
  platformClients = null;
};

const SUBDOMAIN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

/**
 * Fills `{subdomain}`. A subdomain that is not a plain DNS label drops the
 * templated URLs instead of building an address from it.
 */
export const resolveRedirectUrls = (urls: string[], subdomain: string) =>
  urls.flatMap((url) => {
    if (!url.includes('{subdomain}')) {
      return [url];
    }

    return SUBDOMAIN.test(subdomain)
      ? [url.split('{subdomain}').join(subdomain.toLowerCase())]
      : [];
  });

/** A platform client first, then one registered in this organisation. */
export const findOAuthClient = async (
  models: IModels,
  clientId: string,
  subdomain: string,
): Promise<ResolvedOAuthClient | null> => {
  if (!clientId) {
    return null;
  }

  const platform = readPlatformClients().find(
    (client) => client.clientId === clientId,
  );

  if (platform) {
    return {
      clientId: platform.clientId,
      name: platform.name,
      type: platform.type,
      secretHash: platform.secretHash,
      redirectUrls: resolveRedirectUrls(platform.redirectUrls, subdomain),
      platform: true,
    };
  }

  const app = await models.OAuthClientApps.findOne({
    clientId,
    status: 'active',
  }).lean();

  return app
    ? {
        clientId: app.clientId,
        name: app.name,
        type: app.type,
        secretHash: app.secretHash,
        accessTokenLifetime: app.accessTokenLifetime,
        redirectUrls: app.redirectUrls ?? [],
        platform: false,
      }
    : null;
};
