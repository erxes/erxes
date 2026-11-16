import { CORE_API_PREFIX, PLUGIN_SESSION_SCHEME } from '@erxes/core-contract';
import { type OpenAPI, OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';

/** What `OpenAPIGenerator` documents: a router or a contract. */
type Documented = Parameters<OpenAPIGenerator['generate']>[0];

export interface PluginOpenApiOptions {
  /** The plugin's name, as registered (`sales`). */
  plugin: string;
  title: string;
  version: string;
  description?: string;
  /**
   * Where the REST routes are served under the manifest's `api.url` (`/v1`, for an
   * `OpenAPIHandler` with prefix `<api path>/v1`): every path in the document starts with it.
   */
  prefix: `/${string}`;
}

/**
 * The OpenAPI document of a plugin's REST routes, for Settings › Developer › API
 * reference: serve it at the manifest's `api.openapi` (`/openapi.json` under `api.url`).
 * Calls carry a member's 5-minute plugin session token, which a script gets from core
 * with an API key; the document says how.
 *
 *   const rest = new OpenAPIHandler(router);   // mounted at `<api path>/v1`, like the RPC handler
 *   const doc = pluginOpenApi(router, { plugin: 'sales', title: 'Sales', version, prefix: '/v1' });
 *   app.get('/api/openapi.json', async (_req, res) => res.json(await doc));
 */
export const pluginOpenApi = async (
  router: Documented,
  { plugin, title, version, description, prefix }: PluginOpenApiOptions,
): Promise<OpenAPI.Document> => {
  const doc = await new OpenAPIGenerator({
    schemaConverters: [new ZodToJsonSchemaConverter()],
  }).generate(router, {
    info: { title, version, description },
    components: {
      securitySchemes: {
        [PLUGIN_SESSION_SCHEME]: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: `A member's 5-minute session token for this plugin: \`POST ${CORE_API_PREFIX}/plugins/${plugin}/session\` on core with an API key (Settings › Developer › API keys) returns it.`,
        },
      },
    },
    security: [{ [PLUGIN_SESSION_SCHEME]: [] }],
  });

  doc.paths = Object.fromEntries(
    Object.entries(doc.paths ?? {}).map(([path, item]) => [`${prefix}${path}`, item]),
  );

  return doc;
};
