import { AUTOMATION_CONSTANTS } from '@/automations/graphql/automationQueries';
import { ConstantsQueryResponse } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  generateAutomationElementId,
  parseAutomationSeedParams,
} from 'ui-modules';

export type TAutomationSeed = Pick<
  TAutomationBuilderForm,
  'name' | 'triggers' | 'actions'
>;

/**
 * Turns a seed link into the builder's initial form values. The trigger type
 * must match a registered constant, so a hand-written link cannot introduce a
 * node the platform does not know.
 */
export const useAutomationSeed = () => {
  const [searchParams] = useSearchParams();
  const seedParams = parseAutomationSeedParams(searchParams);

  const { data, loading } = useQuery<ConstantsQueryResponse>(
    AUTOMATION_CONSTANTS,
    { fetchPolicy: 'cache-first', skip: !seedParams },
  );

  const triggersConst = data?.automationConstants?.triggersConst;
  const actionsConst = data?.automationConstants?.actionsConst;

  const seed = useMemo<TAutomationSeed | undefined>(() => {
    if (!seedParams) {
      return undefined;
    }

    const constant = (triggersConst || []).find(
      ({ type }) => type === seedParams.triggerType,
    );

    if (!constant) {
      return undefined;
    }

    const actionConstant = seedParams.actionType
      ? (actionsConst || []).find(({ type }) => type === seedParams.actionType)
      : undefined;
    const actionId = actionConstant
      ? seedParams.actionId || generateAutomationElementId()
      : undefined;

    return {
      name: seedParams.name || '',
      triggers: [
        {
          id: seedParams.triggerId || generateAutomationElementId(),
          type: constant.type,
          label: constant.label,
          description: constant.description,
          icon: constant.icon,
          isCustom: constant.isCustom ?? false,
          config: seedParams.triggerConfig,
          actionId,
          position: { x: 0, y: 0 },
        },
      ],
      actions:
        actionConstant && actionId
          ? [
              {
                id: actionId,
                type: actionConstant.type,
                label: actionConstant.label,
                description: actionConstant.description,
                icon: actionConstant.icon,
                config: {},
                // Matches the horizontal gap the node library uses.
                position: { x: 500, y: 0 },
              },
            ]
          : [],
    };
  }, [actionsConst, seedParams, triggersConst]);

  return {
    seed,
    loading: Boolean(seedParams) && loading,
  };
};
