import { caller, type Db, organizations } from '@erxes/core-db';
import { config } from '~/config';

/**
 * The link as the caller can use it. Local storage signs a path on core's own origin, which a
 * member's browser opens as it is; a plugin hands the link to browsers on its own origin, so it
 * gets the address under `APP_URL`, where the web answers `/core/v1`.
 */
export const linkFor = async (client: Db, link: string) => {
  if (!link.startsWith('/') || caller().type !== 'plugin') return link;

  const [organization] = await client
    .select({ subdomain: organizations.subdomain })
    .from(organizations)
    .limit(1);

  return `${config.app.url.replace('{subdomain}', organization?.subdomain ?? '')}${link}`;
};
