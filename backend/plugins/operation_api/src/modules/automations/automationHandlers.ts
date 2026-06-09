import {
  getSetPropertySelector,
  setProperty,
  TAutomationProducers,
  TAutomationProducersInput,
  TAutomationSetPropertyRule,
  TAutomationSetPropertyTarget,
  TAutomationSetPropertyUpdateArgs,
  TCoreModuleProducerContext,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { STATUS_TYPES } from '@/status/constants/types';
import { createProjectAction } from '~/modules/automations/actions/createProjectAction';
import { createTaskAction } from '~/modules/automations/actions/createTaskAction';
import {
  OPERATION_COMPLETION_MODES,
  OPERATION_MILESTONE_REACHED_RELATION_TYPE,
  OPERATION_PROJECT_COMPLETED_RELATION_TYPE,
  OPERATION_TEAM_COMPLETED_RELATION_TYPE,
  TOperationCompletionMode,
} from '~/modules/automations/constants';
import { getString, toRecord, toStringList } from '~/modules/automations/utils';

type TSetPropertyAdapter = {
  fetchItems: (
    selector: Record<string, unknown>,
  ) => Promise<Record<string, unknown>[]>;
  update: (args: TAutomationSetPropertyUpdateArgs) => Promise<unknown>;
};

const getCollectionTypeFromModule = (module: string) => {
  const [, moduleName, collectionName] = module.replace(/\./g, ':').split(':');

  return collectionName || moduleName;
};

const getOperationSetPropertyAdapter = (
  models: IModels,
  module: string,
): TSetPropertyAdapter => {
  const collectionType = getCollectionTypeFromModule(module);

  if (collectionType === 'tasks') {
    return {
      fetchItems: async (selector) =>
        (await models.Task.find(selector).lean()).map(toRecord),
      update: async ({ selector, modifier }) =>
        await models.Task.updateMany(selector, modifier),
    };
  }

  if (collectionType === 'projects') {
    return {
      fetchItems: async (selector) =>
        (await models.Project.find(selector).lean()).map(toRecord),
      update: async ({ selector, modifier }) =>
        await models.Project.updateMany(selector, modifier),
    };
  }

  if (collectionType === 'milestones') {
    return {
      fetchItems: async (selector) =>
        (await models.Milestone.find(selector).lean()).map(toRecord),
      update: async ({ selector, modifier }) =>
        await models.Milestone.updateMany(selector, modifier),
    };
  }

  if (collectionType === 'teams') {
    return {
      fetchItems: async (selector) =>
        (await models.Team.find(selector).lean()).map(toRecord),
      update: async ({ selector, modifier }) =>
        await models.Team.updateMany(selector, modifier),
    };
  }

  throw new Error(`Unsupported operation set property module: ${module}`);
};

const isSetPropertyRule = (
  value: unknown,
): value is TAutomationSetPropertyRule => {
  const record = toRecord(value);

  return (
    typeof record.field === 'string' && typeof record.operator === 'string'
  );
};

const getSetPropertyRules = (value: unknown): TAutomationSetPropertyRule[] =>
  Array.isArray(value) ? value.filter(isSetPropertyRule) : [];

const isSetPropertyTarget = (
  value: unknown,
): value is TAutomationSetPropertyTarget => {
  const record = toRecord(value);

  return (
    typeof record.label === 'string' &&
    typeof record.type === 'string' &&
    ['target', 'relation', 'resolver'].includes(String(record.source)) &&
    ['one', 'many'].includes(String(record.cardinality))
  );
};

const isCompletionMode = (value: string): value is TOperationCompletionMode =>
  value === OPERATION_COMPLETION_MODES.EVERY ||
  value === OPERATION_COMPLETION_MODES.SOME ||
  value === OPERATION_COMPLETION_MODES.FIRST ||
  value === OPERATION_COMPLETION_MODES.LAST;

const getCompletionMode = (config: Record<string, unknown>) => {
  const mode =
    getString(config, 'mode') ||
    getString(config, 'completionMode') ||
    OPERATION_COMPLETION_MODES.EVERY;

  return isCompletionMode(mode) ? mode : OPERATION_COMPLETION_MODES.EVERY;
};

const getSelectedIds = (
  config: Record<string, unknown>,
  pluralKey: string,
  singularKey: string,
) => [...toStringList(config[pluralKey]), ...toStringList(config[singularKey])];

const areTasksComplete = async (
  models: IModels,
  selector: Record<string, unknown>,
) => {
  const totalCount = await models.Task.countDocuments(selector);

  if (!totalCount) {
    return false;
  }

  const incompleteTask = await models.Task.exists({
    ...selector,
    statusType: { $ne: STATUS_TYPES.COMPLETED },
  });

  return !incompleteTask;
};

const areAllTaskSelectorsComplete = async (
  models: IModels,
  selectors: Record<string, unknown>[],
) => {
  if (!selectors.length) {
    return false;
  }

  for (const selector of selectors) {
    if (!(await areTasksComplete(models, selector))) {
      return false;
    }
  }

  return true;
};

const getOrderedMilestoneIds = async ({
  models,
  projectId,
  milestoneIds,
}: {
  models: IModels;
  projectId: string;
  milestoneIds: string[];
}) => {
  const selector: Record<string, unknown> = { projectId };

  if (milestoneIds.length) {
    selector._id = { $in: milestoneIds };
  }

  const milestones = await models.Milestone.find(selector)
    .sort({ targetDate: 1, createdAt: 1, _id: 1 })
    .lean();

  return milestones
    .map(toRecord)
    .map((milestone) => getString(milestone, '_id'))
    .filter((milestoneId): milestoneId is string => Boolean(milestoneId));
};

const getOrderedTeamIds = async ({
  models,
  teamIds,
}: {
  models: IModels;
  teamIds: string[];
}) => {
  const teams = await models.Team.find({ _id: { $in: teamIds } })
    .sort({ createdAt: 1, name: 1, _id: 1 })
    .lean();

  return teams
    .map(toRecord)
    .map((team) => getString(team, '_id'))
    .filter((teamId): teamId is string => Boolean(teamId));
};

const checkProjectCompletedTrigger = async ({
  models,
  target,
  config,
}: {
  models: IModels;
  target: Record<string, unknown>;
  config: Record<string, unknown>;
}) => {
  const projectId = getString(target, '_id') || getString(target, 'projectId');
  const selectedProjectIds = getSelectedIds(config, 'projectIds', 'projectId');

  if (!projectId) {
    return false;
  }

  if (selectedProjectIds.length && !selectedProjectIds.includes(projectId)) {
    return false;
  }

  return await areTasksComplete(models, { projectId });
};

const checkMilestoneReachedTrigger = async ({
  models,
  target,
  config,
}: {
  models: IModels;
  target: Record<string, unknown>;
  config: Record<string, unknown>;
}) => {
  const milestoneId =
    getString(target, '_id') || getString(target, 'milestoneId');
  const projectId = getString(target, 'projectId');
  const selectedProjectIds = getSelectedIds(config, 'projectIds', 'projectId');
  const selectedMilestoneIds = getSelectedIds(
    config,
    'milestoneIds',
    'milestoneId',
  );

  if (!milestoneId || !projectId) {
    return false;
  }

  if (selectedProjectIds.length && !selectedProjectIds.includes(projectId)) {
    return false;
  }

  if (
    selectedMilestoneIds.length &&
    !selectedMilestoneIds.includes(milestoneId)
  ) {
    return false;
  }

  const mode = getCompletionMode(config);

  if (mode === OPERATION_COMPLETION_MODES.SOME) {
    return await areTasksComplete(models, { milestoneId });
  }

  const orderedMilestoneIds = await getOrderedMilestoneIds({
    models,
    projectId,
    milestoneIds: selectedMilestoneIds,
  });

  if (!orderedMilestoneIds.length) {
    return false;
  }

  if (mode === OPERATION_COMPLETION_MODES.FIRST) {
    const firstMilestoneId = orderedMilestoneIds[0];

    return (
      milestoneId === firstMilestoneId &&
      (await areTasksComplete(models, { milestoneId: firstMilestoneId }))
    );
  }

  if (mode === OPERATION_COMPLETION_MODES.LAST) {
    const lastMilestoneId = orderedMilestoneIds[orderedMilestoneIds.length - 1];

    return (
      milestoneId === lastMilestoneId &&
      (await areTasksComplete(models, { milestoneId: lastMilestoneId }))
    );
  }

  return await areAllTaskSelectorsComplete(
    models,
    orderedMilestoneIds.map((id) => ({ milestoneId: id })),
  );
};

const checkTeamCompletedTrigger = async ({
  models,
  target,
  config,
}: {
  models: IModels;
  target: Record<string, unknown>;
  config: Record<string, unknown>;
}) => {
  const teamId = getString(target, '_id') || getString(target, 'teamId');
  const selectedTeamIds = getSelectedIds(config, 'teamIds', 'teamId');

  if (!teamId) {
    return false;
  }

  if (selectedTeamIds.length && !selectedTeamIds.includes(teamId)) {
    return false;
  }

  const mode = getCompletionMode(config);
  const teamIds = selectedTeamIds.length ? selectedTeamIds : [teamId];

  if (mode === OPERATION_COMPLETION_MODES.SOME) {
    return await areTasksComplete(models, { teamId });
  }

  const orderedTeamIds = await getOrderedTeamIds({ models, teamIds });

  if (!orderedTeamIds.length) {
    return false;
  }

  if (mode === OPERATION_COMPLETION_MODES.FIRST) {
    const firstTeamId = orderedTeamIds[0];

    return (
      teamId === firstTeamId && (await areTasksComplete(models, { teamId }))
    );
  }

  if (mode === OPERATION_COMPLETION_MODES.LAST) {
    const lastTeamId = orderedTeamIds[orderedTeamIds.length - 1];

    return (
      teamId === lastTeamId && (await areTasksComplete(models, { teamId }))
    );
  }

  return await areAllTaskSelectorsComplete(
    models,
    orderedTeamIds.map((id) => ({ teamId: id })),
  );
};

export const operationAutomationHandlers = {
  checkCustomTrigger: async (
    {
      collectionType,
      relationType,
      target,
      config,
    }: TAutomationProducersInput[TAutomationProducers.CHECK_CUSTOM_TRIGGER],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => {
    const targetRecord = toRecord(target);
    const configRecord = toRecord(config);

    if (
      collectionType === 'projects' &&
      relationType === OPERATION_PROJECT_COMPLETED_RELATION_TYPE
    ) {
      return await checkProjectCompletedTrigger({
        models,
        target: targetRecord,
        config: configRecord,
      });
    }

    if (
      collectionType === 'milestones' &&
      relationType === OPERATION_MILESTONE_REACHED_RELATION_TYPE
    ) {
      return await checkMilestoneReachedTrigger({
        models,
        target: targetRecord,
        config: configRecord,
      });
    }

    if (
      collectionType === 'teams' &&
      relationType === OPERATION_TEAM_COMPLETED_RELATION_TYPE
    ) {
      return await checkTeamCompletedTrigger({
        models,
        target: targetRecord,
        config: configRecord,
      });
    }

    return false;
  },

  receiveActions: async (
    {
      action,
      execution,
      collectionType,
    }: TAutomationProducersInput[TAutomationProducers.RECEIVE_ACTIONS],
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    if (collectionType === 'tasks') {
      return await createTaskAction({
        models,
        subdomain,
        action,
        execution,
      });
    }

    if (collectionType === 'projects') {
      return await createProjectAction({
        models,
        subdomain,
        action,
        execution,
      });
    }

    throw new Error(
      `Unsupported operation automation action: ${collectionType}`,
    );
  },

  setProperties: async (
    data: TAutomationProducersInput[TAutomationProducers.SET_PROPERTIES],
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    const { action, execution, targetType } = data;
    const actionConfig = toRecord(action.config);
    const module = getString(actionConfig, 'module');

    if (!module) {
      throw new Error('Operation set property action requires module');
    }

    const adapter = getOperationSetPropertyAdapter(models, module);
    const setPropertyTargetValue = actionConfig.setPropertyTarget;
    const setPropertyTarget = isSetPropertyTarget(setPropertyTargetValue)
      ? setPropertyTargetValue
      : undefined;
    const selector = await getSetPropertySelector({
      subdomain,
      module,
      execution,
      targetType,
      relation: setPropertyTarget?.relation,
    });

    return await setProperty({
      models,
      subdomain,
      module,
      rules: getSetPropertyRules(actionConfig.rules),
      execution,
      setPropertyTarget,
      selector,
      fetchItems: adapter.fetchItems,
      update: adapter.update,
      targetType,
    });
  },

  checkTargetMatch: async (
    data: TAutomationProducersInput[TAutomationProducers.CHECK_TARGET_MATCH],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => {
    const { moduleName, collectionType, targetId, selector } = data;

    if (collectionType === 'tasks' && moduleName === 'task') {
      return Boolean(
        await models.Task.exists({
          $and: [{ _id: targetId }, selector],
        }),
      );
    }

    if (collectionType === 'projects' && moduleName === 'project') {
      return Boolean(
        await models.Project.exists({
          $and: [{ _id: targetId }, selector],
        }),
      );
    }

    return false;
  },
};
