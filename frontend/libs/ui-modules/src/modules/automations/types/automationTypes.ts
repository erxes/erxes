import React from 'react';

export type TAutomationActionProps<TConfig = any> = {
  currentActionIndex: number;
  currentAction: TAutomationAction<TConfig>;
  handleSave: (config: TConfig) => void;
};

type WorkflowConnection = {
  sourceId: string;
  targetId: string;
};

export type TAutomationOptionalConnect = {
  sourceId: string;
  actionId: string;
  optionalConnectId: string;
};

type IConfig = {
  workflowConnection?: WorkflowConnection;
  optionalConnect?: TAutomationOptionalConnect[];
  [key: string]: any;
};

export type TAutomationAction<TConfig = any> = {
  id: string;
  type: string;
  icon?: string;
  label: string;
  description: string;
  nextActionId?: string;
  isAvailable?: boolean;
  style?: any;
  config?: TConfig & IConfig;
  position?: any;
  isAvailableOptionalConnect?: boolean;
  workflowId?: string;
  isCustom?: boolean;

  count?: number;
  targetActionId?: string;
};

export type TAutomationTrigger<TConfig = any> = {
  id: string;
  type: string;
  icon?: string;
  label: string;
  description: string;
  actionId?: string;
  style?: any;
  config?: TConfig;
  position?: any;
  isAvailableOptionalConnect?: boolean;
  isCustom?: boolean;
  workflowId?: string;

  count?: number;
};

export type TAutomationWorkflowNode = {
  id: string;
  name: string;
  description: string;
  config: any;
  automationId: string;
  position?: any;
};

export interface IAutomationHistoryAction {
  createdAt: Date;
  actionId: string;
  actionType: string;
  actionConfig?: any;
  nextActionId?: string;
  result?: any;
}

export interface IAutomationHistory {
  _id: string;
  createdAt: Date;
  modifiedAt?: Date;
  automationId: string;
  triggerId: string;
  triggerType: string;
  triggerConfig?: any;
  nextActionId?: string;
  targetId: string;
  target: any;
  status: 'active' | 'waiting' | 'error' | 'missed' | 'complete';
  description: string;
  actions?: IAutomationHistoryAction[];
  startWaitingDate?: Date;
  waitingActionId?: string;
}

export type BaseAutomationRemoteProps = {
  type?: string;
  componentType: string;
};

export type AutomationTriggerFormProps<TConfig = any> =
  BaseAutomationRemoteProps & {
    formRef: React.RefObject<{
      submit: () => void;
    }>;
    componentType: 'triggerForm';
    activeTrigger: TAutomationTrigger<TConfig>;
    onSaveTriggerConfig: (config: TConfig) => void;
  };

export type AutomationActionFormProps<TConfig = any> =
  BaseAutomationRemoteProps & {
    formRef: React.RefObject<{
      submit: () => void;
    }>;
    componentType: 'actionForm';
    currentAction: TAutomationAction<TConfig>;
    onSaveActionConfig: (config: TConfig) => void;
    trigger?: TAutomationTrigger;
    targetType?: string;
  };

export type AutomationTriggerConfigProps<TConfig = any> =
  BaseAutomationRemoteProps & {
    componentType: 'triggerConfigContent';
    config: TConfig;
  };

export type AutomationActionNodeConfigProps<
  TActionConfig = any,
  TTriggerConfig = any,
> = BaseAutomationRemoteProps & {
  componentType: 'actionNodeConfiguration';
  actionData: TAutomationAction<TActionConfig>;
  config?: TActionConfig;
  trigger?: TAutomationTrigger<TTriggerConfig>;
};

export type AutomationExecutionHistoryNameProps<TTarget = any> = {
  componentType: 'historyName';
  triggerType: string;
  target: TTarget;
};

export type AutomationExecutionActionResultProps = {
  componentType: 'historyActionResult';
  action: IAutomationHistoryAction;
  result: IAutomationHistoryAction['result'];
  status: IAutomationHistory['status'];
};

export type AutomationCustomWaitEventFormProps<TConfig = any> = {
  componentType: 'waitEvent';
  config: TConfig;
  actionData: TAutomationAction;
};

export type AutomationRemoteEntryProps =
  | AutomationTriggerFormProps
  | AutomationActionFormProps
  | AutomationTriggerConfigProps
  | AutomationActionNodeConfigProps
  | AutomationExecutionHistoryNameProps
  | AutomationExecutionActionResultProps
  | AutomationCustomWaitEventFormProps
  | { componentType: 'automationBotsContent' };

export type AutomationRemoteEntryComponentType =
  AutomationRemoteEntryProps['componentType'];

type ExtractPropsByComponentType<T, C extends string> = T extends {
  componentType: C;
}
  ? T
  : never;

export type AutomationRemoteEntryTypes = {
  [K in AutomationRemoteEntryComponentType]: ExtractPropsByComponentType<
    AutomationRemoteEntryProps,
    K
  >;
};

export type IAutomationsTriggerConfigConstants = {
  type: string;
  icon: string;
  label: string;
  description: string;
  isCustom?: boolean;
  conditions?: {
    type: string;
    icon: string;
    label: string;
    description: string;
  }[];
};

export type IAutomationsActionFolkConfig = {
  key: string;
  label: string;
  type: 'default' | 'success' | 'error';
};

export type IAutomationsActionConfigConstants = {
  type: string;
  icon: string;
  label: string;
  description: string;
  isAvailableOptionalConnect?: boolean;
  emailRecipientsConst?: any;
  isTargetSource?: boolean;
  targetSourceType?: string;
  allowTargetFromActions?: boolean;
  folks?: IAutomationsActionFolkConfig[];
};

export type IAutomationNodeConfigConstants =
  | IAutomationsTriggerConfigConstants
  | IAutomationsActionConfigConstants;
