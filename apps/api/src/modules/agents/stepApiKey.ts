import { apiKeys, type Db } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { memberOf } from '~/http/auth';
import { callerCan } from '~/http/access';
import { fail } from '~/http/errors';
import { keyCaller } from '~/modules/apiKeys/keyCaller';
import type { AutomationStepScope } from './automationStep';

const unusable = (reason: string) =>
  fail('KEY_NOT_ALLOWED', `The step's API key ${reason}; assign another key in the step`, {
    rule: 'step',
  });

/**
 * Whom an agent step's erxes API calls act as: the API key the step was given, with its
 * rules, as a script calling with it would be. Only a key the member who turned the
 * automation on may see (their own, or any with api_keys.manage) counts. The call comes
 * from erxes itself, so the key's address limits don't apply.
 */
export const stepKeyCaller = async (tx: Db, step: AutomationStepScope, keyId: string) => {
  const [key] = await tx.select().from(apiKeys).where(eq(apiKeys.id, keyId)).limit(1);

  if (!key) throw unusable('was removed');

  if (key.userId !== step.member.userId && !callerCan('api_keys.manage'))
    throw unusable("isn't one the member who turned this automation on may use");

  if (key.expiresAt && key.expiresAt.getTime() <= Date.now()) throw unusable('has expired');

  if (key.kind === 'member') {
    const member = await memberOf(step.orgId, key.userId);

    if (!member) throw unusable("belongs to a member who can't sign in any more");

    return { ...member, apiKeyId: key.id };
  }

  const result = await keyCaller(tx, key, null, { anyAddress: true });

  if ('denied' in result) throw unusable(`is refused: ${result.denied.reason}`);

  return result.caller;
};
