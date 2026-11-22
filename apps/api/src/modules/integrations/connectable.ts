import { callerCan } from '~/http/access';
import { fail } from '~/http/errors';
import type { Integration } from './define';
import { keyedOf } from './registry';

export const manages = (integration: Integration) => callerCan(integration.permission);

export const connectable = (key: string) => {
  const integration = keyedOf(key);

  if (!manages(integration)) {
    throw fail('NOT_ALLOWED', "Your role doesn't allow this", {
      permission: integration.permission,
    });
  }

  return integration;
};
