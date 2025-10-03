import React from 'react';

export type IActionProps = {
  currentActionIndex: number;
  currentAction: IAction;
  handleSave: (config: any) => void;
};

type WorkflowConnection = {
  sourceId: string;
  targetId: string;
};

export type OptionalConnect = {
  sourceId: string;
  actionId: string;
  optionalConnectId: string;
};

type IConfig = {
  workflowConnection?: WorkflowConnection;
  optionalConnect?: OptionalConnect[];
  [key: string]: any;
};

export type IAction<TConfig = any> = {
  id: string;
  type: string;
  icon?: string;
  label: string;
  description: string;
  nextActionId?: string;
  isAvailable?: boolean;
  style?: any;
  config: TConfig & IConfig;
  position?: any;
  isAvailableOptionalConnect?: boolean;
  workflowId?: string;
  isCustom?: boolean;

  count?: number;
};

export type ITrigger<TConfig = any> = {
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
    activeTrigger: ITrigger<TConfig>;
    onSaveTriggerConfig: (config: TConfig) => void;
  };

export type AutomationActionFormProps<TConfig = any> =
  BaseAutomationRemoteProps & {
    formRef: React.RefObject<{
      submit: () => void;
    }>;
    componentType: 'actionForm';
    currentAction: IAction<TConfig>;
    onSaveActionConfig: (config: TConfig) => void;
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
  currentAction?: any;
  config?: TActionConfig;
  trigger?: ITrigger<TTriggerConfig>;
  OptionConnectHandle?:
    | (({ optionalId }: { optionalId: string }) => React.ReactNode)
    | null;
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
};

export type AutomationRemoteEntryProps =
  | AutomationTriggerFormProps
  | AutomationActionFormProps
  | AutomationTriggerConfigProps
  | AutomationActionNodeConfigProps
  | AutomationExecutionHistoryNameProps
  | AutomationExecutionActionResultProps
  | { componentType: 'automationBotsContent' };

export type AutomationRemoteEntryTypes = {
  TriggerForm: AutomationTriggerFormProps;
  ActionForm: AutomationActionFormProps;
  TriggerNodeConfig: AutomationTriggerConfigProps;
  ActionNodeConfig: AutomationActionNodeConfigProps;
  HistoryName: AutomationExecutionHistoryNameProps;
  ActionResult: AutomationExecutionActionResultProps;
};

export type IAutomationsTriggerConfigConstants = {
  type: string;
  icon: string;
  label: string;
  description: string;
  isCustom?: boolean;
  connectableActionTypes?: string[];
  conditions?: {
    type: string;
    icon: string;
    label: string;
    description: string;
  }[];
};

export type IAutomationsActionConfigConstants = {
  type: string;
  icon: string;
  label: string;
  description: string;
  isAvailableOptionalConnect?: boolean;
  emailRecipientsConst?: any;
  connectableActionTypes?: string[];
};
