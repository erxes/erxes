import { oc } from '@orpc/contract';
import { z } from 'zod';
import { COMMON_ERRORS, ERRORS } from './errors';
import { EventType } from './platform';
import { PluginName } from './values';

/**
 * Another plugin's API this plugin reads for an organisation: the permissions of that plugin it
 * reads with (`sales.deal.view`), and why, shown to the owner who approves it.
 */
export const PluginRead = z.object({
  plugin: PluginName,
  permissions: z.array(EventType).min(1).max(50),
  reason: z.string().trim().min(1).max(300),
});

export type PluginRead = z.infer<typeof PluginRead>;

/** `plugins.callToken`'s answer: a token for the other plugin's API, and where that API is. */
export const PluginCallToken = z.object({
  token: z.string(),
  expiresAt: z.iso.datetime(),
  apiUrl: z.string(),
  /** What the token lets the caller do in that plugin (`sales.deal.view`). */
  permissions: z.array(z.string()),
});

const { PLUGIN_NOT_INSTALLED, PLUGIN_UNREACHABLE, READ_NOT_APPROVED } = ERRORS;

const base = oc.errors({
  ...COMMON_ERRORS,
  PLUGIN_NOT_INSTALLED,
  PLUGIN_UNREACHABLE,
  READ_NOT_APPROVED,
});

/** One plugin reading another's API (in `pluginsContract`). */
export const pluginReadsContract = {
  callToken: base
    .route({
      method: 'POST',
      path: '/plugins/{name}/call-token',
      summary: 'Get a token to call another plugin',
      description:
        "A 5-minute token for another plugin's API (`aud` that plugin), for this organisation, with the permissions the owner approved in the manifest's `pluginReads`. 400 PLUGIN_NOT_INSTALLED when that plugin isn't installed here, 403 READ_NOT_APPROVED when nothing is approved, 502 PLUGIN_UNREACHABLE when it has no API address",
    })
    .input(z.object({ name: PluginName }))
    .output(PluginCallToken),
};
