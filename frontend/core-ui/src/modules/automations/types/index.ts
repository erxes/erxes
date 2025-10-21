import {
  NodeContentComponentProps,
  WaitEventFormComponentProps,
} from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { STATUSES_BADGE_VARIABLES } from '@/automations/constants';
import {
  TAutomationBuilderActions,
  TAutomationBuilderForm,
  TAutomationBuilderTriggers,
  TAutomationBuilderWorkflows,
} from '@/automations/utils/automationFormDefinitions';
import { Edge, EdgeProps, Node, ReactFlowInstance } from '@xyflow/react';
import {
  IAutomationHistoryAction,
  IAutomationsActionConfigConstants,
  IAutomationsTriggerConfigConstants,
  TAutomationAction,
  TAutomationActionProps,
  TAutomationTrigger,
} from 'ui-modules';

export interface AutomationConstants {
  triggersConst: IAutomationsTriggerConfigConstants[];
  triggerTypesConst: string[];
  actionsConst: IAutomationsActionConfigConstants[];
  propertyTypesConst: Array<{ value: string; label: string }>;
}
export interface ConstantsQueryResponse {
  automationConstants: AutomationConstants;
}

export type NodeData<TConfig = any> = {
  id: string;
  nodeIndex: number;
  label: string;
  nodeType: AutomationNodeType;
  icon?: string;
  description?: string;
  type: string;
  category?: string;
  config?: TConfig;
  configurable?: boolean;
  outputs?: number;
  color?: string;
  error?: string;
  isCustom?: boolean;
  nextActionId?: string;
  actionId?: string;
  workflowId?: string;
  beforeTitleContent?: (
    id: string,
    type: AutomationNodeType,
  ) => React.ReactNode;
};

export type WorkflowNodeData = {
  automationId: string;
  config: any;
  description: string;
  label: string;
  nodeType: string;
};

export interface IAutomationDoc {
  name: string;
  status: string;
  triggers: TAutomationTrigger[];
  actions: TAutomationAction[];
  updatedAt?: string;
  createdAt?: string;
  updatedBy?: string;
  createdBy?: string;
  updatedUser?: any;
  createdUser?: any;
  tags?: any[];
  tagIds?: string[];
}

export interface IAutomationNoteDoc {
  triggerId: string;
  actionId: string;
  description: string;
  createdUser?: any;
  createdAt?: Date;
}

export interface IAutomation extends IAutomationDoc {
  _id: string;
}

export type AutomationDropHandlerParams = {
  event: React.DragEvent<HTMLDivElement>;
  reactFlowInstance: ReactFlowInstance<Node<NodeData>, Edge<EdgeProps>> | null;
  triggers: TAutomationBuilderTriggers;
  actions: TAutomationBuilderActions;
  workflows?: TAutomationBuilderWorkflows;
  getNodes: () => Node<NodeData>[];
};

export type TDraggingNode = {
  nodeType: AutomationNodeType;
  type: string;
  label: string;
  description: string;
  icon: string;
  isCustom?: boolean;
  awaitingToConnectNodeId?: string;
};
export type StatusBadgeValue =
  (typeof STATUSES_BADGE_VARIABLES)[keyof typeof STATUSES_BADGE_VARIABLES];

export enum AutomationsHotKeyScope {
  Builder = 'automation-builder',
  BuilderSideBar = 'automation-builder-sidebar',
  BuilderPanel = 'automation-builder-panel',
  HistoriesFilter = 'automation-histories-filter',
}

export enum AutomationsPath {
  Index = '/automations',
  Detail = '/edit/:id',
}

export enum AutomationNodeType {
  Trigger = 'trigger',
  Action = 'action',
  Workflow = 'workflow',
}

export enum AutomationNodesType {
  Triggers = 'triggers',
  Actions = 'actions',
  Workflows = 'workflows',
}

export enum AutomationBuilderTabsType {
  Builder = 'builder',
  History = 'history',
}

export type AutomationTriggerSidebarCoreFormProps = {
  formRef: React.RefObject<{
    submit: () => void;
  }>;
  activeNode: NodeData;
  handleSave: (config: any) => void;
};

export type CoreActionSidebarFormProps = {
  formRef: React.RefObject<{
    submit: () => void;
  }>;
  activeNode: NodeData;
  handleSave: (config: any) => void;
};

// Base component type for lazy-loaded components
export type LazyAutomationComponent<TComponentProps = any> =
  React.LazyExoticComponent<React.ComponentType<TComponentProps>>;

// Base component configuration
interface BaseComponentConfig<TConfig = any> {
  nodeContent?: LazyAutomationComponent<NodeContentComponentProps<TConfig>>;
}

// Generic action component configuration with config type parameter
interface ActionComponentConfig<TConfig = any>
  extends BaseComponentConfig<TConfig> {
  sidebar?: LazyAutomationComponent<TAutomationActionProps>;
  actionResult?: LazyAutomationComponent<{
    componentType: 'historyActionResult';
    result: any;
    action: IAutomationHistoryAction;
  }>;
  waitEvent?: LazyAutomationComponent<WaitEventFormComponentProps>;
}

// Trigger-specific component configuration (only base properties)
export interface TriggerComponentConfig extends BaseComponentConfig {
  sidebar?: LazyAutomationComponent<AutomationTriggerSidebarCoreFormProps>;
}

// Workflow-specific component configuration (only base properties)
interface WorkflowComponentConfig extends BaseComponentConfig {
  sidebar?: LazyAutomationComponent<TAutomationActionProps>;
}

interface TAutomationNodeTypeComponentConfig {
  [AutomationNodeType.Action]: ActionComponentConfig;
  [AutomationNodeType.Trigger]: TriggerComponentConfig;
  [AutomationNodeType.Workflow]: WorkflowComponentConfig;
}

// Type for the entire components object structure
export type AutomationComponentMap<
  N extends AutomationNodeType = AutomationNodeType,
> = {
  [key: string]: TAutomationNodeTypeComponentConfig[N];
};

export interface ConnectionInfo {
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  sourceId: string;
  targetId: string;
  sourceType?: AutomationNodeType;
  targetType?: AutomationNodeType;
  connectType?: 'optional' | 'workflow' | 'folks';
  optionalConnectId?: string;
  automationId?: string;
  actionId?: string;
  sourceIndex: number;
  targetIndex: number;
}
