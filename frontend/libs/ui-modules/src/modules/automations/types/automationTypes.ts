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
  optionalConnects?: TAutomationOptionalConnect[];
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
  // Source template when inserted from one
  templateId?: string;
  // Snapshot of the member actions this workflow owns (containment model)
  actions?: TAutomationAction[];
  icon?: string;
  position?: any;
};

export interface IAutomationHistoryAction {
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
  durationMs?: number;
  status?:
    | 'success'
    | 'skipped'
    | 'error'
    | 'waiting'
    | 'queued'
    | 'standby'
    | 'dropped';
  skipReason?: string;
  // Which try this row is; above 1 only when an error policy asked for another.
  attempt?: number;
  actionId: string;
  actionType: string;
  actionConfig?: any;
  nextActionId?: string;
  result?: any;
  // Set on workflow node actions: links to the child execution
  childExecutionId?: string;
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
  status: 'active' | 'waiting' | 'standby' | 'error' | 'missed' | 'complete';
  description: string;
  actions?: IAutomationHistoryAction[];
  // Actions that failed while the run itself carried on.
  handledFailureActionIds?: string[];
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
    // Every action reachable backwards from the current one, so a form can tell
    // how it is connected to its trigger (e.g. behind an optional connect).
    previousActions?: TAutomationAction[];
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

export type TAiKnowledgeSourceConfig = {
  pluginName: string;
  moduleName: string;
  key: string;
  label: string;
  sourceSelector: 'remote-module' | 'local';
  // Off for collections too large to stream, e.g. customers.
  supportsFullScope?: boolean;
};

export type TAiToolConfig = {
  pluginName: string;
  moduleName: string;
  key: string;
  label: string;
  input: string;
  output: string;
};

export type TAiKnowledgeSourceSelection = {
  pluginName: string;
  moduleName: string;
  key: string;
  sourceIds: string[];
  config?: Record<string, unknown>;
};

export type TAiToolSelection = {
  pluginName: string;
  moduleName: string;
  key: string;
  enabled?: boolean;
  config?: Record<string, unknown>;
};

export type TAiKnowledgeSourceIndexStatus = {
  pluginName: string;
  moduleName: string;
  sourceKey: string;
  sourceId: string;
  status: 'queued' | 'indexing' | 'indexed' | 'failed' | 'skipped';
  chunkCount?: number;
  indexedAt?: string;
  indexError?: string;
  runId?: string;
  totalCount?: number;
  processedCount?: number;
  indexedCount?: number;
  failedCount?: number;
  removedCount?: number;
};

export type AutomationAiKnowledgeSourceSelectorProps = {
  componentType: 'aiKnowledgeSourceSelector';
  source: TAiKnowledgeSourceConfig;
  value: string[];
  config?: Record<string, unknown>;
  onChange: (sourceIds: string[], config?: Record<string, unknown>) => void;
  statuses?: TAiKnowledgeSourceIndexStatus[];
};

/**
 * Answers one prerequisite of a built-in template — a bot, a pipeline stage, an
 * integration — while it is being installed. Only the plugin that owns the
 * thing knows what counts as a candidate and how to list this organization's,
 * so it provides the component; it reports the chosen value upward, and a
 * requirement with no value is what keeps the install closed.
 */
export type AutomationTemplateRequirementProps = {
  componentType: 'templateRequirement';
  kind: string;
  value?: unknown;
  /**
   * The answer to the requirement this one declared `dependsOn`, for the cases
   * where a candidate list is scoped by an earlier choice — the stages of the
   * pipeline just picked, rather than every stage there is.
   */
  dependsOnValue?: unknown;
  onChange: (value: unknown | null) => void;
};

export type AutomationRemoteEntryProps =
  | AutomationTemplateRequirementProps
  | AutomationTriggerFormProps
  | AutomationActionFormProps
  | AutomationTriggerConfigProps
  | AutomationActionNodeConfigProps
  | AutomationExecutionHistoryNameProps
  | AutomationExecutionActionResultProps
  | AutomationCustomWaitEventFormProps
  | AutomationAiKnowledgeSourceSelectorProps
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
  output?: {
    variables?: Array<{
      key: string;
      label: string;
      type?: string;
      exposure?: 'placeholder' | 'reference';
    }>;
  };
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
  group?: string;
  isAvailableOptionalConnect?: boolean;
  emailRecipientsConst?: any;
  isTargetSource?: boolean;
  targetSourceType?: string;
  allowTargetFromActions?: boolean;
  allowedMultiTriggerTypes?: string[];
  /** Target record types this action can operate on; empty means any. */
  requiresTargetTypes?: string[];
  folks?: IAutomationsActionFolkConfig[];
  /** The action queues its work and reports back later. */
  deferred?: { enable?: boolean; mode?: string; timeoutMinutes?: number };
  /** Whether the action can carry a retry / error-branch policy. */
  errorPolicy?: { supported?: boolean };
};

export type IAutomationNodeConfigConstants =
  | IAutomationsTriggerConfigConstants
  | IAutomationsActionConfigConstants;
