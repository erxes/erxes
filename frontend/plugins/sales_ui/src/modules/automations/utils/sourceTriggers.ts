import { isRecord } from '@/deals/utils/dealJson';
import type { SalesSourceAutomationsQuery } from '~/gql/graphql';

type SalesSourceAutomation = NonNullable<
  NonNullable<SalesSourceAutomationsQuery['automations']>[number]
>;

export type TSourceTrigger = {
  type: string;
  config?: Record<string, unknown>;
};

// Trigger config is JSON; only an object can carry the record it belongs to.
export const toSourceTriggers = (
  triggers: SalesSourceAutomation['triggers'],
  triggerTypes: string[],
): TSourceTrigger[] =>
  (triggers ?? []).flatMap((trigger) =>
    trigger?.type && triggerTypes.includes(trigger.type)
      ? [
          {
            type: trigger.type,
            config: isRecord(trigger.config) ? trigger.config : undefined,
          },
        ]
      : [],
  );
