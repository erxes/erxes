import {
  AUTOMATION_CORE_ACTION_PLACEMENTS,
  getAutomationActionConstant,
  IAutomationExecutionDocument,
  TAutomationActionContribution,
  TAutomationActionPlacement,
  TAutomationRememberConfig,
} from 'erxes-api-shared/core-modules';
import { IModels } from '../connectionResolver';

// Core actions declare placement in the shared map; plugin actions in their
// own constants.
export const getActionPlacement = async (
  actionType: string,
): Promise<TAutomationActionPlacement> =>
  AUTOMATION_CORE_ACTION_PLACEMENTS[actionType] ||
  (await getAutomationActionConstant(actionType).catch(() => undefined)) ||
  {};

// The node's own config over the defaults of every action type it runs after.
export const resolvePlacedConfig = async (
  action: { type: string; config?: unknown },
  ranBefore: Set<string>,
): Promise<Record<string, unknown>> => {
  const { defaultsWhenAfter = [] } = await getActionPlacement(action.type);

  return Object.assign(
    {},
    ...defaultsWhenAfter
      .filter(({ actionType }) => ranBefore.has(actionType))
      .map(({ config }) => config),
    action.config && typeof action.config === 'object' ? action.config : {},
  );
};

export const resolveRememberConfig = async (
  action: { type: string; config?: unknown },
  ranBefore: Set<string>,
) => {
  const { remember } = await resolvePlacedConfig(action, ranBefore);
  const config = remember as Partial<TAutomationRememberConfig> | undefined;

  return config?.as
    ? { as: config.as, fields: config.fields || [] }
    : undefined;
};

// A workflow run belongs to the path that started it.
export const findRanActionTypes = async (
  models: IModels,
  execution: IAutomationExecutionDocument,
) => {
  const types = new Set(
    (execution.actions || []).map(({ actionType }) => actionType),
  );

  if (execution.parentExecutionId) {
    const parent = await models.Executions.findOne(
      { _id: execution.parentExecutionId },
      { actions: 1 },
    ).lean();

    for (const { actionType } of parent?.actions || []) {
      types.add(actionType);
    }
  }

  return types;
};

export const contributesTo = async (
  actionType: string,
  previousActionType: string,
  kind: TAutomationActionContribution,
) => {
  const [{ addsToPrevious = [] }, { accepts = [] }] = await Promise.all([
    getActionPlacement(actionType),
    getActionPlacement(previousActionType),
  ]);

  return (
    accepts.includes(kind) &&
    addsToPrevious.some(
      (entry) => entry.actionType === previousActionType && entry.kind === kind,
    )
  );
};
