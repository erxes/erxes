import { useQuery } from '@apollo/client';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  automationReturnLinkSearch,
  buildAutomationSeedLink,
  TAutomationReturnLink,
} from 'ui-modules';
import { SALES_SOURCE_AUTOMATIONS } from '../graphql/sourceAutomationsQuery';

export type TSourceTrigger = {
  type: string;
  config?: Record<string, unknown>;
};

// 'own': runs on this record only; 'all': on every record of its kind.
export type TSourceScope = 'own' | 'all';

type TAutomationRecord = {
  _id: string;
  name?: string;
  status?: string;
  triggers?: TSourceTrigger[];
};

export type TSourceAutomation = {
  _id: string;
  name: string;
  status?: string;
  events: string[];
  isAll: boolean;
};

/**
 * The automations one sales record (a POS, a pipeline) sets off, and links
 * that open new ones from it with the same way back.
 */
export const useSourceAutomations = ({
  triggerTypes,
  scopeOf,
  describe,
  newTrigger,
  label,
}: {
  triggerTypes: string[];
  // Whether a trigger runs on this record; null when it is another's.
  scopeOf: (trigger: TSourceTrigger) => TSourceScope | null;
  describe: (trigger: TSourceTrigger) => string;
  newTrigger?: TSourceTrigger;
  label: string;
}) => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const returnTo: TAutomationReturnLink = {
    path: `${pathname}${search}`,
    label,
  };

  const { data, loading, error } = useQuery<{
    automations: TAutomationRecord[];
  }>(SALES_SOURCE_AUTOMATIONS, {
    variables: { triggerTypes },
    skip: !newTrigger,
    // Automations are edited elsewhere; coming back must show the change.
    fetchPolicy: 'cache-and-network',
  });

  const automations: TSourceAutomation[] = (data?.automations || []).flatMap(
    ({ _id, name, status, triggers }) => {
      const own = (triggers || []).flatMap((trigger) => {
        const scope = triggerTypes.includes(trigger.type)
          ? scopeOf(trigger)
          : null;

        return scope ? [{ trigger, scope }] : [];
      });

      return own.length
        ? [
            {
              _id,
              name: name || '',
              status,
              events: own
                .map(({ trigger }) => describe(trigger))
                .filter(Boolean),
              isAll: own.every(({ scope }) => scope === 'all'),
            },
          ]
        : [];
    },
  );

  const createAutomation = () => {
    if (!newTrigger) {
      return;
    }

    navigate(
      buildAutomationSeedLink({
        triggerType: newTrigger.type,
        triggerConfig: newTrigger.config,
        name: label,
        returnTo,
      }),
    );
  };

  // Opening an existing one keeps the same way back as creating one.
  const editPath = (automationId: string) =>
    `/automations/edit/${automationId}${automationReturnLinkSearch(returnTo)}`;

  return {
    automations,
    loading,
    error,
    returnTo,
    editPath,
    createAutomation,
  };
};
