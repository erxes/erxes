import {
  CORE_API_PREFIX,
  CUSTOMER_TOKEN_SCHEME,
  EMPLOYEE_TOKEN_SCHEME,
  PLUGIN_SESSION_SCHEME,
  type PluginApiAudience,
  WEBSITE_KEY_SCHEME,
} from '@erxes/core-contract';
import { type OpenAPI, OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';

/** What `OpenAPIGenerator` documents: a router or a contract. */
type Documented = Parameters<OpenAPIGenerator['generate']>[0];

export interface PluginOpenApiOptions {
  /** The plugin's name, as registered (`sales`). */
  plugin: string;
  /** Who calls these routes, which decides how they sign in (the manifest's `api.docs`). */
  audience: PluginApiAudience;
  title: string;
  version: string;
  description?: string;
  /**
   * The address the document's paths start from, which "try it" calls: the manifest's
   * `api.url` (`${publicUrl}/api`) for routes under it, or the plugin's public URL for routes
   * outside it (a website's `/public/v1`, customers' `/customer`).
   */
  server: string;
  /**
   * Where the REST routes are mounted under `server` (`/v1`, for an `OpenAPIHandler` with
   * prefix `<api path>/v1`): every path in the document starts with it.
   */
  prefix: `/${string}`;
}

type Security = Pick<OpenAPI.Document, 'components' | 'security'>;

const BEARER = { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } as const;

const customerToken = {
  ...BEARER,
  description: `A customer's access token from core: \`POST ${CORE_API_PREFIX}/customer-auth/sign-in\` returns it (core's Customer API documents the sign-in).`,
};

/** How each audience signs in, for the document's security schemes. */
const securityOf = (plugin: string, audience: PluginApiAudience): Security => {
  if (audience === 'member') {
    return {
      components: {
        securitySchemes: {
          [PLUGIN_SESSION_SCHEME]: {
            ...BEARER,
            description: `A member's 5-minute session token for this plugin: \`POST ${CORE_API_PREFIX}/plugins/${plugin}/session\` on core with an API key (Settings › Developer › API keys) returns it.`,
          },
        },
      },
      security: [{ [PLUGIN_SESSION_SCHEME]: [] }],
    };
  }

  if (audience === 'employee') {
    return {
      components: {
        securitySchemes: {
          [EMPLOYEE_TOKEN_SCHEME]: {
            ...BEARER,
            description:
              "An employee's access token, from this plugin's own sign-in in this document (employees sign in to the plugin's app, not to erxes).",
          },
        },
      },
      security: [{ [EMPLOYEE_TOKEN_SCHEME]: [] }],
    };
  }

  if (audience === 'customer') {
    return {
      components: { securitySchemes: { [CUSTOMER_TOKEN_SCHEME]: customerToken } },
      security: [{ [CUSTOMER_TOKEN_SCHEME]: [] }],
    };
  }

  // A website's server sends the key the plugin issued; a signed-in visitor adds their token.
  return {
    components: {
      securitySchemes: {
        [WEBSITE_KEY_SCHEME]: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: "The website's key, from the plugin's settings. Keep it on the server.",
        },
        [CUSTOMER_TOKEN_SCHEME]: customerToken,
      },
    },
    security: [
      { [WEBSITE_KEY_SCHEME]: [] },
      { [WEBSITE_KEY_SCHEME]: [], [CUSTOMER_TOKEN_SCHEME]: [] },
    ],
  };
};

/**
 * One OpenAPI document of a plugin's REST routes, for Settings › Developer › API reference:
 * serve it at its path in the manifest's `api.docs` (`/openapi/member.json` under `api.url`).
 * Each audience signs in its own way (`securityOf`), and the document says how.
 *
 *   const rest = new OpenAPIHandler(router);   // mounted at `<api path>/v1`, like the RPC handler
 *   const doc = pluginOpenApi(router, {
 *     plugin: 'sales', audience: 'member', title, version, server: `${publicUrl}/api`, prefix: '/v1',
 *   });
 *   app.get('/api/openapi/member.json', async (_req, res) => res.json(await doc));
 */
export const pluginOpenApi = async (
  router: Documented,
  { plugin, audience, title, version, description, server, prefix }: PluginOpenApiOptions,
): Promise<OpenAPI.Document> => {
  const doc = await new OpenAPIGenerator({
    schemaConverters: [new ZodToJsonSchemaConverter()],
  }).generate(router, {
    info: { title, version, description },
    servers: [{ url: server }],
    ...securityOf(plugin, audience),
  });

  doc.paths = Object.fromEntries(
    Object.entries(doc.paths ?? {}).map(([path, item]) => [`${prefix}${path}`, item]),
  );

  return doc;
};
