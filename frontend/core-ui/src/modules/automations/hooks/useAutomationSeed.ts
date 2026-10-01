import { AUTOMATION_CONSTANTS } from '@/automations/graphql/automationQueries';
import { ConstantsQueryResponse } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  generateAutomationElementId,
  IAutomationsActionConfigConstants,
  parseAutomationSeedParams,
  TAutomationSeedAction,
} from 'ui-modules';

export type TAutomationSeed = Pick<
  TAutomationBuilderForm,
  'name' | 'triggers' | 'actions'
>;

type TSeedOptionalConnect = { actionId?: string; sourceId?: string };

// Matches the gaps the node library uses between columns and rows.
const COLUMN_GAP = 500;
const ROW_GAP = 240;

const childIdsOf = ({ nextActionId, config }: TAutomationSeedAction) => [
  ...(nextActionId ? [nextActionId] : []),
  ...(Array.isArray(config?.optionalConnects)
    ? (config.optionalConnects as TSeedOptionalConnect[])
        .map(({ actionId }) => actionId)
        .filter((id): id is string => !!id)
    : []),
];

// Each node sits one column right of whatever leads to it; a column's nodes
// are stacked around the trigger's row.
const layoutSeedActions = (actions: TAutomationSeedAction[]) => {
  const byId = new Map(actions.map((action) => [action.id, action]));
  const depthOf = new Map<string, number>([[actions[0].id, 0]]);
  const queue = [actions[0].id];

  while (queue.length) {
    const id = queue.shift() as string;
    const action = byId.get(id);

    for (const childId of action ? childIdsOf(action) : []) {
      if (byId.has(childId) && !depthOf.has(childId)) {
        depthOf.set(childId, (depthOf.get(id) || 0) + 1);
        queue.push(childId);
      }
    }
  }

  const columns = new Map<number, string[]>();

  for (const { id } of actions) {
    const depth = depthOf.get(id) ?? 0;
    columns.set(depth, [...(columns.get(depth) || []), id]);
  }

  const positions = new Map<string, { x: number; y: number }>();

  for (const [depth, ids] of columns) {
    ids.forEach((id, row) =>
      positions.set(id, {
        x: COLUMN_GAP * (depth + 1),
        y: ROW_GAP * (row - (ids.length - 1) / 2),
      }),
    );
  }

  return positions;
};

/**
 * A seeded flow opens only when every node is a registered action and every
 * connection lands on a node of the flow; otherwise the trigger opens alone.
 */
const buildSeedActions = (
  seedActions: TAutomationSeedAction[],
  actionsConst: IAutomationsActionConfigConstants[],
): TAutomationSeed['actions'] => {
  const ids = new Set(seedActions.map(({ id }) => id));
  const constants = seedActions.map(({ type }) =>
    actionsConst.find((constant) => constant.type === type),
  );

  if (
    constants.some((constant) => !constant) ||
    ids.size !== seedActions.length ||
    seedActions.some((action) =>
      childIdsOf(action).some((childId) => !ids.has(childId)),
    )
  ) {
    return [];
  }

  const positions = layoutSeedActions(seedActions);

  return seedActions.map((action, index) => {
    const constant = constants[index] as IAutomationsActionConfigConstants;
    const config = action.config || {};

    return {
      id: action.id,
      type: constant.type,
      label: constant.label,
      description: constant.description,
      icon: constant.icon,
      nextActionId: action.nextActionId,
      config: Array.isArray(config.optionalConnects)
        ? {
            ...config,
            // The builder draws a branch only from connects its node owns.
            optionalConnects: (
              config.optionalConnects as TSeedOptionalConnect[]
            ).map((connect) => ({ ...connect, sourceId: action.id })),
          }
        : config,
      position: positions.get(action.id) || { x: COLUMN_GAP, y: 0 },
    };
  });
};

/**
 * Turns a seed link into the builder's initial form values. The trigger and
 * action types must match registered constants, so a hand-written link cannot
 * introduce a node the platform does not know. A link may leave the trigger
 * out and seed only actions.
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

    const constant = seedParams.triggerType
      ? (triggersConst || []).find(
          ({ type }) => type === seedParams.triggerType,
        )
      : undefined;

    if (seedParams.triggerType && !constant) {
      return undefined;
    }

    const flow = seedParams.actions?.length
      ? buildSeedActions(seedParams.actions, actionsConst || [])
      : undefined;

    // Without a trigger the flow is all there is; the user picks the trigger
    // and connects it, left free where no module can say what fits.
    if (!constant) {
      return flow?.length
        ? { name: seedParams.name || '', triggers: [], actions: flow }
        : undefined;
    }
    const actionConstant =
      !flow && seedParams.actionType
        ? (actionsConst || []).find(
            ({ type }) => type === seedParams.actionType,
          )
        : undefined;
    const actionId = flow
      ? flow[0]?.id
      : actionConstant
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
      actions: flow
        ? flow
        : actionConstant && actionId
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
