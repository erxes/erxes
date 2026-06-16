import { Connection } from 'mongoose';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { applyWrite } from './applyWrite';
import { ApplyWriteInput, ApplyWriteResult } from './types';

/**
 * Dispatch one inverse op to the plugin that owns the entity.
 *
 * - core entities  -> apply in-process via applyWrite (same connection).
 * - remote entities -> sendTRPCMessage to the owning plugin's revert.applyWrite
 *   procedure, forwarding context:{processId,userId} so the reverted write logs
 *   under the request's processId (TRPC does NOT auto-forward processId unless
 *   the context is passed explicitly).
 *
 * The pluginName is the first segment of the contentType (`plugin:module.coll`).
 */

const pluginNameOf = (contentType: string): string => {
  return contentType.split(':')[0] || 'core';
};

/**
 * Route a computed inverse op to its applier: core/`auto:` entities apply
 * in-process via applyWrite; remote-plugin entities dispatch over TRPC. Both
 * carry the REQUEST processId so the revert's writes log under it.
 */
export const applyInverse = async (args: {
  connection: Connection;
  subdomain: string;
  input: ApplyWriteInput;
  requestProcessId: string;
  userId: string;
}): Promise<ApplyWriteResult> => {
  const { connection, subdomain, input, requestProcessId, userId } = args;

  const pluginName = pluginNameOf(input.contentType);

  // `core` = first-party entities; `auto` = entities captured generically by the
  // shared schemaWrapper hooks (which run in THIS process on THIS connection).
  // Both apply in-process via applyWrite. Only a genuinely remote plugin entity
  // is dispatched over TRPC.
  if (pluginName === 'core' || pluginName === 'auto') {
    return await applyWrite({
      connection,
      subdomain,
      input,
    });
  }

  const result = (await sendTRPCMessage({
    subdomain,
    pluginName,
    method: 'mutation',
    module: 'revert',
    action: 'applyWrite',
    input,
    context: {
      processId: requestProcessId,
      userId,
    },
    defaultValue: null,
  })) as ApplyWriteResult | null;

  if (!result) {
    return {
      ok: false,
      conflict: true,
      reason: `Plugin "${pluginName}" did not apply the revert write (unreachable or revert.applyWrite not mounted)`,
    };
  }

  return result;
};
