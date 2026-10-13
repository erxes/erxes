import {
  IAutomationAction,
  IAutomationExecutionDocument,
  isAutomationConditionMatched,
} from 'erxes-api-shared/core-modules';
import { isInSegment } from '../../utils/isInSegment';

const FALLBACK_OPTION_ID = 'fallback';

type TSplitCondition = {
  propertyName?: string;
  propertyOperator?: string;
  propertyValue?: any;
};

type TSplitOption = {
  id: string;
  label?: string;
  segmentId?: string;
  config?: {
    conditions?: TSplitCondition[];
    conditionsConjunction?: 'and' | 'or';
  };
};

type TSplitOptionalConnect = {
  optionalConnectId?: string;
  actionId?: string;
};

type TSplitActionConfig = {
  options?: TSplitOption[];
  optionalConnects?: TSplitOptionalConnect[];
};

const getTargetActionResult = (
  execution: IAutomationExecutionDocument,
  targetActionId?: string,
) => {
  if (!targetActionId) {
    return undefined;
  }

  return [...(execution.actions || [])]
    .reverse()
    .find(({ actionId }) => actionId === targetActionId)?.result;
};

const resolveNextActionId = (config: TSplitActionConfig, optionId: string) => {
  return config.optionalConnects?.find(
    ({ optionalConnectId }) => optionalConnectId === optionId,
  )?.actionId;
};

const getNestedValue = (target: any, path?: string) => {
  if (!path) {
    return undefined;
  }

  return path.split('.').reduce((current, key) => {
    if (current === undefined || current === null) {
      return undefined;
    }

    return current[key];
  }, target);
};

const isConditionMatched = (target: any, condition: TSplitCondition) =>
  isAutomationConditionMatched(
    getNestedValue(target, condition.propertyName),
    condition.propertyOperator,
    condition.propertyValue,
  );

const isOptionConfigMatched = (target: any, option: TSplitOption) => {
  const conditions = option.config?.conditions || [];

  if (!conditions.length) {
    return false;
  }

  const matcher = (condition: TSplitCondition) =>
    isConditionMatched(target, condition);

  return (option.config?.conditionsConjunction || 'and') === 'or'
    ? conditions.some(matcher)
    : conditions.every(matcher);
};

const isSplitOptionMatched = async ({
  subdomain,
  execution,
  action,
  option,
}: {
  subdomain: string;
  execution: IAutomationExecutionDocument;
  action: IAutomationAction<TSplitActionConfig>;
  option: TSplitOption;
}) => {
  if (option.segmentId) {
    return await isInSegment(
      subdomain,
      option.segmentId,
      execution.targetId,
      0,
    );
  }

  return isOptionConfigMatched(
    getTargetActionResult(execution, action.targetActionId) ?? execution.target,
    option,
  );
};

export const executeSplitAction = async (
  subdomain: string,
  execution: IAutomationExecutionDocument,
  action: IAutomationAction<TSplitActionConfig>,
) => {
  const config = action.config || {};
  const options = config.options || [];

  let selectedOption: TSplitOption | undefined;

  for (const option of options) {
    if (!option.id) {
      continue;
    }

    const isMatched = await isSplitOptionMatched({
      subdomain,
      execution,
      action,
      option,
    });

    if (isMatched) {
      selectedOption = option;
      break;
    }
  }

  const selectedOptionId = selectedOption?.id || FALLBACK_OPTION_ID;

  return {
    nextActionId: resolveNextActionId(config, selectedOptionId),
    result: {
      optionId: selectedOptionId,
      optionLabel: selectedOption?.label || 'Fallback',
      segmentId: selectedOption?.segmentId,
      matched: Boolean(selectedOption),
      fallback: selectedOptionId === FALLBACK_OPTION_ID,
    },
  };
};
