import { z } from 'zod';
import { PLUGIN_API_AUDIENCES } from './values';

/**
 * A plugin's OpenAPI documents (the manifest's `api.docs`): one per audience, each a path
 * under `api.url` (`/openapi/member.json`). Settings › Developer › API reference shows them,
 * and the assistant finds and calls the routes of the `member` one.
 */
export const PluginApiDocs = z
  .array(
    z.object({
      audience: z.enum(PLUGIN_API_AUDIENCES),
      path: z.string().regex(/^(\/[a-z0-9][a-z0-9_.-]*)+$/, 'a path like /openapi/member.json'),
    }),
  )
  .max(PLUGIN_API_AUDIENCES.length)
  .refine(
    (docs) => new Set(docs.map((doc) => doc.audience)).size === docs.length,
    'one document per audience',
  );
