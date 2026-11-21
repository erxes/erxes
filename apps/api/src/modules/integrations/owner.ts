import {
  IntegrationHookCall,
  type IntegrationHookAccount,
  type IntegrationFormValues,
  IntegrationRefusal,
} from '@erxes/core-contract';
import { newId } from '@erxes/core-db';
import type { z } from 'zod';
import { fail } from '~/http/errors';
import { logger } from '~/logger';
import { postToPlugin } from '~/modules/plugins/pluginDelivery';
import type { PluginDefinition } from './definitions';
import type { VaultValues } from './vault';

const CORE_INTEGRATION_TYP = 'erxes-core-integration+jwt';

const ANSWER_BYTES = 2 * 1024 * 1024;

const log = logger.child({ component: 'integrations' });

type Ask =
  | { hook: 'start' }
  | { hook: 'connect'; values: IntegrationFormValues }
  | { hook: 'connected' | 'check' | 'disconnect'; account: IntegrationHookAccount };

export interface OwnerScope {
  orgId: string;
  userId: string | null;
  setup: VaultValues | null;
}

export type OwnerAnswer<T> = { ok: true; answer: T } | { ok: false; message: string };

const unreachable = (definition: PluginDefinition) =>
  fail('PLUGIN_UNREACHABLE', `${definition.plugin} did not answer. Try again shortly.`);

const parsedJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const post = async (definition: PluginDefinition, scope: OwnerScope, ask: Ask) => {
  if (!definition.apiUrl) throw unreachable(definition);

  const callId = newId();

  try {
    return await postToPlugin({
      plugin: definition.plugin,
      url: definition.apiUrl,
      path: `/integrations/${definition.spec.key}/${ask.hook}`,
      orgId: scope.orgId,
      kind: 'integration',
      id: callId,
      body: JSON.stringify(
        IntegrationHookCall.parse({
          ...ask,
          callId,
          orgId: scope.orgId,
          userId: scope.userId,
          integration: definition.spec.key,
          setup: scope.setup,
        }),
      ),
      typ: CORE_INTEGRATION_TYP,
      headers: { 'User-Agent': 'erxes-integrations/1' },
      timeoutMs: 30_000,
      maxBytes: ANSWER_BYTES,
    });
  } catch (error) {
    log.warn({ err: error, plugin: definition.plugin, hook: ask.hook }, 'integration hook failed');

    throw unreachable(definition);
  }
};

export const askOwner = async <T>(
  definition: PluginDefinition,
  scope: OwnerScope,
  ask: Ask,
  answer: z.ZodType<T>,
): Promise<OwnerAnswer<T>> => {
  const response = await post(definition, scope, ask);
  const body = parsedJson(response.body);

  if (response.status >= 400 && response.status < 500) {
    const refusal = IntegrationRefusal.safeParse(body);

    return {
      ok: false,
      message: refusal.success
        ? refusal.data.message
        : `${definition.plugin} refused (${response.status})`,
    };
  }

  const parsed = response.status >= 200 && response.status < 300 ? answer.safeParse(body) : null;

  if (!parsed?.success) {
    log.warn(
      { plugin: definition.plugin, hook: ask.hook, status: response.status },
      'integration hook answered what core could not read',
    );

    throw unreachable(definition);
  }

  return { ok: true, answer: parsed.data };
};

export const hasHook = (definition: PluginDefinition, hook: 'connected' | 'check' | 'disconnect') =>
  definition.spec.hooks.includes(hook);
