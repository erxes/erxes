import { sendAutomationWorkerMessage } from '@/utils/sendAutomationWorkerMessage';
import {
  IAutomationAction,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';

export const executeAiAgentAction = async (
  subdomain: string,
  execution: IAutomationExecutionDocument,
  action: IAutomationAction,
) => {
  try {
    const inputData = await getInputData(
      execution,
      action?.config.inputMapping,
    );

    return await sendAutomationWorkerMessage({
      queueName: 'aiAgent',
      jobName: 'executeAiAgent',
      subdomain,
      data: {
        aiAgentActionId: action.id,
        executionId: execution._id,
        actionId: action.id,
        inputData,
        triggerData: execution.target,
      },
    });
  } catch (error) {
    throw new Error(`AI Agent Action failed: ${error.message}`);
  }
};

const getInputData = async (
  execution: IAutomationExecutionDocument,
  inputMapping: any,
) => {
  switch (inputMapping.source) {
    case 'trigger':
      return getNestedValue(execution.target, inputMapping.path);
    case 'previousAction':
      const prevAction = (execution.actions || []).find(
        (a: any) => a.id === inputMapping.path,
      );
      return prevAction?.result;
    case 'custom':
      return inputMapping.customValue;
    default:
      return '';
  }
};

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};
