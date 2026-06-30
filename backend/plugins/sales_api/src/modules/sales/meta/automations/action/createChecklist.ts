import {
  AUTOMATION_CORE_ACTIONS,
  splitType,
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { SALES_DEAL_FIND_OBJECT_TYPE } from '~/modules/sales/meta/automations/constants';

type TReceiveActionsData =
  TAutomationProducersInput[TAutomationProducers.RECEIVE_ACTIONS];
type TAutomationAction = TReceiveActionsData['action'];
type TAutomationExecution = TReceiveActionsData['execution'];
type TAutomationExecutionAction = NonNullable<
  TAutomationExecution['actions']
>[number];

type TChecklistActionItemConfig = {
  label: string;
  isChecked: boolean;
};

type TChecklistActionConfig = {
  name: string;
  items: TChecklistActionItemConfig[];
};

type TChecklistItemCreateInput = {
  checklistId: string;
  content: string;
  isChecked: boolean;
  order: number;
  createdDate: Date;
};

type TChecklistActionResult = {
  checklistId: string;
  checklistTitle: string;
  targetId: string;
  itemCount: number;
  stageId?: string;
  pipelineId?: string;
  boardId?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const getStringValue = (
  source: Record<string, unknown>,
  key: string,
): string | undefined => {
  const value = source[key];
  return typeof value === 'string' && value ? value : undefined;
};

const isSalesDealType = (type?: string) => {
  const [pluginName, moduleName, collectionName] = splitType(type || '');

  return (
    pluginName === 'sales' &&
    ((moduleName === 'sales' &&
      ['deal', 'deals'].includes(collectionName || '')) ||
      moduleName === 'deal')
  );
};

const isCreateDealActionType = (type?: string) => {
  const [pluginName, moduleName, collectionName, method] = splitType(
    type || '',
  );

  return (
    pluginName === 'sales' &&
    ((moduleName === 'sales' &&
      ['deal', 'deals'].includes(collectionName || '') &&
      method === 'create') ||
      (moduleName === 'deal' && collectionName === 'create'))
  );
};

const getPreviousTargetAction = ({
  execution,
  action,
}: {
  execution: TAutomationExecution;
  action: TAutomationAction;
}) => {
  const actions = execution.actions || [];

  if (action.targetActionId) {
    return actions.find(
      (item) =>
        item.actionId === action.targetActionId && item.status === 'success',
    );
  }

  return actions.find(
    (item) => item.nextActionId === action.id && item.status === 'success',
  );
};

const getTargetDealIdFromCreateDealAction = (
  previousAction: TAutomationExecutionAction,
) => {
  if (!isCreateDealActionType(previousAction.actionType)) {
    return undefined;
  }

  if (!isRecord(previousAction.result)) {
    return undefined;
  }

  return (
    getStringValue(previousAction.result, 'targetId') ||
    getStringValue(previousAction.result, 'itemId')
  );
};

const getTargetDealIdFromFindObjectAction = (
  previousAction: TAutomationExecutionAction,
) => {
  if (previousAction.actionType !== AUTOMATION_CORE_ACTIONS.FIND_OBJECT) {
    return undefined;
  }

  if (!isRecord(previousAction.result)) {
    return undefined;
  }

  const { found, objectType } = previousAction.result;

  if (found !== true || objectType !== SALES_DEAL_FIND_OBJECT_TYPE) {
    return undefined;
  }

  return getStringValue(previousAction.result, 'objectId');
};

const getChecklistTargetDealId = ({
  execution,
  action,
}: {
  execution: TAutomationExecution;
  action: TAutomationAction;
}) => {
  const previousAction = getPreviousTargetAction({ execution, action });

  if (previousAction) {
    const targetDealId =
      getTargetDealIdFromCreateDealAction(previousAction) ||
      getTargetDealIdFromFindObjectAction(previousAction);

    if (!targetDealId) {
      throw new Error('Create sales checklist requires a sales deal target');
    }

    return targetDealId;
  }

  if (!isSalesDealType(execution.triggerType)) {
    throw new Error('Create sales checklist only supports sales deal targets');
  }

  if (execution.targetId) {
    return execution.targetId;
  }

  if (isRecord(execution.target)) {
    const targetId = getStringValue(execution.target, '_id');

    if (targetId) {
      return targetId;
    }
  }

  throw new Error('Sales deal target was not found');
};

const normalizeChecklistItems = (
  items: unknown,
): TChecklistActionItemConfig[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.reduce<TChecklistActionItemConfig[]>((acc, item) => {
    if (!isRecord(item)) {
      return acc;
    }

    const label = getStringValue(item, 'label')?.trim();

    if (!label) {
      return acc;
    }

    acc.push({
      label,
      isChecked: item.isChecked === true,
    });

    return acc;
  }, []);
};

const getChecklistConfig = (config: unknown): TChecklistActionConfig => {
  const configRecord = isRecord(config) ? config : {};
  const name = getStringValue(configRecord, 'name')?.trim();

  if (!name) {
    throw new Error('Checklist name is required');
  }

  return {
    name,
    items: normalizeChecklistItems(configRecord.items),
  };
};

export const createChecklist = async (
  models: IModels,
  execution: TAutomationExecution,
  action: TAutomationAction,
): Promise<TChecklistActionResult> => {
  const targetId = getChecklistTargetDealId({ execution, action });
  const config = getChecklistConfig(action.config);
  const targetDeal = await models.Deals.findOne({ _id: targetId }).lean();

  if (!targetDeal) {
    throw new Error('Sales deal target was not found');
  }

  const targetStage = targetDeal.stageId
    ? await models.Stages.findOne({ _id: targetDeal.stageId }).lean()
    : null;
  const targetPipeline = targetStage?.pipelineId
    ? await models.Pipelines.findOne({ _id: targetStage.pipelineId }).lean()
    : null;

  const checklist = await models.Checklists.create({
    contentType: 'deal',
    contentTypeId: targetId,
    title: config.name,
    createdDate: new Date(),
  });

  const itemInputs: TChecklistItemCreateInput[] = config.items.map(
    (item, index) => ({
      checklistId: checklist._id,
      content: item.label,
      isChecked: item.isChecked,
      order: index,
      createdDate: new Date(),
    }),
  );

  if (itemInputs.length) {
    await models.ChecklistItems.insertMany(itemInputs);
  }

  return {
    checklistId: checklist._id,
    checklistTitle: checklist.title,
    targetId,
    itemCount: itemInputs.length,
    stageId: targetDeal.stageId,
    pipelineId: targetStage?.pipelineId,
    boardId: targetPipeline?.boardId,
  };
};
