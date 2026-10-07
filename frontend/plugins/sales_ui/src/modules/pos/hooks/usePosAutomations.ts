import { useQuery } from '@apollo/client';
import { isEnabled } from 'erxes-ui';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  automationReturnLinkSearch,
  buildAutomationSeedLink,
  generateAutomationElementId,
} from 'ui-modules';
import { POS_ORDER_AUTOMATIONS } from '@/pos/graphql/queries/posAutomations';

// The trigger's relationType ('event') is part of its registered type.
const POS_ORDER_TRIGGER_TYPE = 'sales:pos.orders.event';
const LOYALTY_ADJUST_SCORE_ACTION = 'loyalty:score.score.create';

type TPosOrderTriggerConfig = { eventType?: string; posId?: string };

type TAutomationRecord = {
  _id: string;
  name?: string;
  status?: string;
  triggers?: { type: string; config?: TPosOrderTriggerConfig }[];
};

export type TPosAutomation = {
  _id: string;
  name: string;
  status?: string;
  eventTypes: string[];
  // Runs on every POS, not only this one.
  isAllPos: boolean;
};

/** The automations a POS's orders start, and links that open new ones. */
export const usePosAutomations = (posId?: string, posName?: string) => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const returnTo = { path: `${pathname}${search}`, label: posName || 'POS' };
  const { data, loading, error } = useQuery<{
    automations: TAutomationRecord[];
  }>(POS_ORDER_AUTOMATIONS, {
    variables: { triggerTypes: [POS_ORDER_TRIGGER_TYPE] },
    skip: !posId,
    // Automations are edited elsewhere; coming back must show the change.
    fetchPolicy: 'cache-and-network',
  });

  const automations: TPosAutomation[] = (data?.automations || []).flatMap(
    ({ _id, name, status, triggers }) => {
      // A trigger with no POS runs on every POS, this one included.
      const own = (triggers || []).filter(
        ({ type, config }) =>
          type === POS_ORDER_TRIGGER_TYPE &&
          (!config?.posId || config.posId === posId),
      );

      return own.length
        ? [
            {
              _id,
              name: name || '',
              status,
              eventTypes: own.flatMap(({ config }) =>
                config?.eventType ? [config.eventType] : [],
              ),
              isAllPos: own.every(({ config }) => !config?.posId),
            },
          ]
        : [];
    },
  );

  // The builder picks the score campaign; an automation without one won't save.
  const createPointsAutomation = () => {
    if (!posId) {
      return;
    }

    navigate(
      buildAutomationSeedLink({
        triggerType: POS_ORDER_TRIGGER_TYPE,
        triggerConfig: { eventType: 'paid', posId },
        name: posName || '',
        returnTo,
        actions: [
          {
            id: generateAutomationElementId(),
            type: LOYALTY_ADJUST_SCORE_ACTION,
            config: { attribution: '{{ trigger.customerId }}', action: 'add' },
          },
        ],
      }),
    );
  };

  const createAutomation = () => {
    if (!posId) {
      return;
    }

    navigate(
      buildAutomationSeedLink({
        triggerType: POS_ORDER_TRIGGER_TYPE,
        triggerConfig: { posId },
        name: posName || '',
        returnTo,
      }),
    );
  };

  // Opening an existing one keeps the same way back as creating one.
  const editPath = (automationId: string) =>
    `/automations/edit/${automationId}${automationReturnLinkSearch(returnTo)}`;

  return {
    automations,
    editPath,
    loading,
    error,
    // Without loyalty the builder would drop the seeded action as unknown.
    canGivePoints: isEnabled('loyalty'),
    createPointsAutomation,
    createAutomation,
  };
};
