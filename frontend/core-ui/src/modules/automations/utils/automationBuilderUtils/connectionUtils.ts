import { CONNECTION_PROPERTY_NAME_MAP } from '@/automations/constants';
import {
  AutomationNodeType,
  ConnectionInfo,
  NodeData,
} from '@/automations/types';
import {
  TAutomationBuilderActions,
  TAutomationBuilderForm,
} from '@/automations/utils/automationFormDefinitions';
import { Node } from '@xyflow/react';
import { TAutomationOptionalConnect } from 'ui-modules';

export const generateOptionalConnection = (
  optionalConnectId: string,
  sourceAction: TAutomationBuilderActions[number],
  targetId: string,
) => {
  const sourceConfig = sourceAction?.config || {};

  const optionalConnects = sourceConfig?.optionalConnects || [];

  //update optionalConnects if optional connect exists in sourceAction
  let updatedOptionalConnects = optionalConnects.map(
    (optConnect: TAutomationOptionalConnect) =>
      optConnect.sourceId === sourceAction.id &&
      optConnect.optionalConnectId === optionalConnectId
        ? { ...optConnect, actionId: targetId }
        : optConnect,
  );

  // add optionalConnect if optional connect not exists in sourceAction
  if (
    !optionalConnects.some(
      (optConnect: TAutomationOptionalConnect) =>
        optConnect.sourceId === sourceAction.id &&
        optConnect.optionalConnectId === optionalConnectId,
    )
  ) {
    updatedOptionalConnects.push({
      sourceId: sourceAction.id,
      actionId: targetId,
      optionalConnectId: optionalConnectId,
    });
  }

  // disconnect optionalConnect if optional connect exists in sourceAction but optionalConnectId is undefined

  if (
    optionalConnects.some(
      (optConnect: TAutomationOptionalConnect) =>
        optConnect.sourceId === sourceAction.id &&
        optConnect.optionalConnectId === optionalConnectId,
    )
  ) {
    updatedOptionalConnects = optionalConnects.filter(
      (optConnect: TAutomationOptionalConnect) =>
        optConnect.optionalConnectId !== optionalConnectId,
    );
  }

  return {
    ...sourceAction,
    config: {
      ...sourceConfig,
      optionalConnects: updatedOptionalConnects,
    },
  };
};

export const generateWorkflowConnection = (
  sourceAction: TAutomationBuilderActions[number],
  workFlows: TAutomationBuilderForm['workflows'] = [],
  info: ConnectionInfo,
) => {
  const workFlow = workFlows.find(
    ({ automationId }) => automationId === info.automationId,
  );

  if (workFlow) {
    if (!workFlow.config) {
      workFlow.config = {};
    }
    const existingConnections = workFlow.config.connections || [];
    const { sourceId, sourceHandle, actionId } = info;

    let updatedConnections = existingConnections.map((conn: any) =>
      conn.sourceActionId === sourceId && conn.handle === sourceHandle
        ? { ...conn, targetActionId: actionId }
        : conn,
    );

    if (
      !existingConnections.some(
        (conn: any) =>
          conn.sourceActionId === sourceId && conn.handle === sourceHandle,
      )
    ) {
      updatedConnections.push({
        sourceActionId: sourceId,
        handle: sourceHandle,
        targetActionId: actionId,
      });
    }

    workFlow.config = {
      ...workFlow.config,
      connections: updatedConnections,
    };
    if (sourceAction) {
      sourceAction.workflowId = workFlow.id; // save workflow reference
    }
  }
  return { sourceAction, workFlow };
};

export const generateBranchConnection = (
  sourceNode: TAutomationBuilderActions[number],
  targetId: string,
  sourceHandle: string,
) => {
  const config = sourceNode.config || {};
  const [sourceHandleType] = sourceHandle.split('-');
  return {
    ...sourceNode,
    config: {
      ...config,
      [sourceHandleType]: targetId,
    },
  } as TAutomationBuilderActions[number];
};

export const generateFindObjectConnection = (
  sourceNode: TAutomationBuilderActions[number],
  targetId: string,
  sourceHandle: string,
) => {
  const config = sourceNode.config || {};
  console.log({ sourceHandle });
  const [sourceHandleType] = sourceHandle.split('-');
  return {
    ...sourceNode,
    config: {
      ...config,
      [sourceHandleType]: targetId,
    },
  } as TAutomationBuilderActions[number];
};

export const generateFolksConnection = (
  sourceNode: TAutomationBuilderActions[number],
  targetId: string,
  sourceHandle: string,
) => {
  const config = sourceNode.config || {};
  // Extract the folk key from sourceHandle format: "nodeId__folkKey"
  const parts = sourceHandle.split('__');
  const folkKey = parts[parts.length - 1]; // Get the folk key (last part)

  return {
    ...sourceNode,
    config: {
      ...config,
      [folkKey]: targetId,
    },
  } as TAutomationBuilderActions[number];
};
export const generateStandarConnection = (
  sourceNode: any,
  targetId: string,
  sourceType: AutomationNodeType,
) => {
  const connectionFieldName = CONNECTION_PROPERTY_NAME_MAP[sourceType];
  return {
    ...sourceNode,
    [connectionFieldName]: targetId,
  };
};

export const checkValidOptionalConnect = (source: Node<NodeData>) => {
  return !(source?.data.config?.optionalConnects || []).find(
    ({ sourceId, actionId }: TAutomationOptionalConnect) =>
      sourceId === source.id && actionId,
  );
};
