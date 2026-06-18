import { z } from 'zod';
import {
  AutomationBaseInput,
  CheckCustomTriggerInput,
  FindObjectInput,
  CheckTargetMatchInput,
  ReceiveActionsInput,
  ResolveOutputPathsInput,
  SetPropertiesInput,
} from './zodTypes';
import { IAutomationExecution } from './definitions';

export type IAutomationContext = {
  subdomain: string;
  processId?: string;
};

export type TAutomationOutputVariable = {
  key: string;
  label: string;
  exposure?: 'placeholder' | 'reference';
  field?: string;
  referenceFields?: TAutomationOutputVariable[];
  referenceType?: string;
  sourceType?: string;
  type?: string;
};

export type TAutomationOutputPropertySource = {
  key: string;
  label: string;
  propertyType: string;
};

export type TAutomationOutputDefinition = {
  variables: TAutomationOutputVariable[];
  propertySource?: TAutomationOutputPropertySource;
  resolverKeys?: string[];
};

export type TAutomationSetPropertyTarget = {
  label: string;
  description?: string;
  type: string;
  source: 'target' | 'relation' | 'resolver';
  cardinality: 'one' | 'many';
  sourceType?: string;
  relation?: {
    contentType: string;
    relatedContentType: string;
  };
  resolverKey?: string;
};

export type TAutomationRuntimeOutputResolver<TTarget = Record<string, any>> =
  (args: {
    subdomain: string;
    source: TTarget;
    path: string;
    defaultValue?: any;
  }) => any | Promise<any>;

export type TAutomationRuntimeOutputDefinition<TTarget = any> =
  TAutomationOutputDefinition & {
    resolvers?: Record<string, TAutomationRuntimeOutputResolver<TTarget>>;
  };

export type TAutomationFindObjectLookupFieldDefinition = {
  value: string;
  label: string;
};

export type TAutomationFindObjectTargetDefinition = {
  value: string;
  label: string;
  lookupFields: TAutomationFindObjectLookupFieldDefinition[];
  output?: TAutomationRuntimeOutputDefinition;
};

export type IAutomationsTriggerConfig = {
  type?: string;
  moduleName?: string;
  collectionName?: string;
  relationType?: string;
  icon: string;
  label: string;
  description: string;
  isCustom?: boolean;
  output?: TAutomationRuntimeOutputDefinition;
  conditions?: {
    type: string;
    icon: string;
    label: string;
    description: string;
  }[];
  setPropertyTargets?: TAutomationSetPropertyTarget[];
};

export type IAutomationsActionConfigFolkConfig = {
  key: string;
  label: string;
  type: TAutomationActionFolks;
};

export type IAutomationsActionConfig = {
  type?: string;
  moduleName?: string;
  collectionName?: string;
  method?: 'create';
  icon: string;
  label: string;
  description: string;
  group?: string;
  isAvailableOptionalConnect?: boolean;
  emailRecipientsConst?: any;
  isTargetSource?: boolean;
  targetSourceType?: string;
  allowTargetFromActions?: boolean;
  folks?: IAutomationsActionConfigFolkConfig[];
  output?: TAutomationRuntimeOutputDefinition;
  setPropertyTargets?: TAutomationSetPropertyTarget[];
};

export type IAutomationsBotsConfig = {
  moduleName: string;
  name: string;
  label: string;
  description: string;
  logo: string;
  totalCountQueryName: string;
};

export type TAiContextHistoryItem = {
  type?: string;
  role?: 'customer' | 'agent' | 'bot' | 'system' | 'user' | 'assistant';
  text?: string;
  createdAt?: string;
  meta?: Record<string, unknown>;
};

export type TAiContext = {
  version: 1;
  input?: {
    text?: string;
    id?: string;
    createdAt?: string;
  };
  history?: TAiContextHistoryItem[];
  facts?: Record<string, unknown>;
  memory?: {
    scopeKey?: string;
  };
};

type IAutomationTriggersActionsConfig =
  | {
      triggers: IAutomationsTriggerConfig[];
      actions?: IAutomationsActionConfig[];
    }
  | {
      triggers?: IAutomationsTriggerConfig[];
      actions: IAutomationsActionConfig[];
    };

export type AutomationConstants = IAutomationTriggersActionsConfig & {
  bots?: IAutomationsBotsConfig[];
  findObjectTargets?: TAutomationFindObjectTargetDefinition[];
  setPropertyTargets?: TAutomationSetPropertyTarget[];
};

export type TAutomationFindObjectResult = {
  found: boolean;
  objectType: string;
  objectId?: string;
  object: Record<string, any> | null;
  matchedBy: {
    field: string;
    value: string;
  };
};

type TAutomationAdditionalAttribute = {
  _id: number;
  name: string;
  group?: string;
  label?: string;
  type?: string;
  validation?: string;
  options?: string[];
  selectOptions?: Array<{ label: string; value: string }>;
};
export interface AutomationProducers {
  receiveActions?: (
    args: z.infer<typeof ReceiveActionsInput>,
    context: IAutomationContext,
  ) => Promise<{
    result: any;
    waitCondition?: {
      shouldCheckOptionalConnect: any[];
      targetId?: string;
      expectedState: Record<string, any>;
      propertyName: string;
      expectedStateConjunction: 'every' | 'some';
    };
  }>;

  generateAiContext?: (
    args: {
      subdomain: string;
      data: {
        moduleName: string;
        collectionType?: string;
        triggerType: string;
        target: Record<string, any>;
      };
    },
    context: IAutomationContext,
  ) => Promise<TAiContext | null>;

  resolveOutputPaths?: (
    args: z.infer<typeof ResolveOutputPathsInput>,
    context: IAutomationContext,
  ) => Promise<Record<string, any>>;
  checkCustomTrigger?: (
    args: z.infer<typeof CheckCustomTriggerInput>,
    context: IAutomationContext,
  ) => Promise<boolean>;

  checkTargetMatch?: (
    args: z.infer<typeof CheckTargetMatchInput>,
    context: IAutomationContext,
  ) => Promise<boolean>;

  findObject?: (
    args: z.infer<typeof FindObjectInput>,
    context: IAutomationContext,
  ) => Promise<TAutomationFindObjectResult>;

  setProperties?: (
    args: z.infer<typeof SetPropertiesInput>,
    context: IAutomationContext,
  ) => Promise<TAutomationSetPropertyResult>;
}

export interface AutomationConfigs extends AutomationProducers {
  constants?: AutomationConstants;
}

export interface IPerValueProps<TModels> {
  models: TModels;
  subdomain: string;
  relatedItem: Record<string, unknown>;
  rule: TAutomationSetPropertyRule;
  target: Record<string, unknown>;
  triggerType?: string;
  targetType?: string;
  serviceName?: string;
  execution: Record<string, unknown>;
}

export type TAutomationSetPropertyRule = {
  field: string;
  fieldLabel?: string;
  operator: string;
  value?: unknown;
  forwardTo?: unknown;
  isExpression?: boolean;
};

export type TAutomationSetPropertyChange = {
  field: string;
  fieldLabel: string;
  operator: string;
  placeholder?: string;
  value?: unknown;
  status: 'updated' | 'cleared' | 'skipped' | 'failed';
};

export type TAutomationSetPropertyResult = {
  target: {
    label: string;
    type: string;
    count: number;
  };
  changes: TAutomationSetPropertyChange[];
  summary: string;
};

export type TAutomationSetPropertyModifier = {
  $set?: Record<string, unknown>;
  $unset?: Record<string, unknown>;
  $push?: Record<string, unknown>;
  $addToSet?: Record<string, unknown>;
  $pull?: Record<string, unknown>;
};

export type TAutomationSetPropertyUpdateArgs = {
  selector: Record<string, unknown>;
  modifier: TAutomationSetPropertyModifier;
  item?: Record<string, unknown>;
};

export interface IPropertyProps<TModels> {
  models: TModels;
  subdomain: string;
  module: string;
  rules: TAutomationSetPropertyRule[];
  execution: IAutomationExecution;
  setPropertyTarget?: TAutomationSetPropertyTarget;
  relatedItems?: Record<string, unknown>[];
  selector?: Record<string, unknown>;
  fetchItems?: (
    selector: Record<string, unknown>,
  ) => Promise<Record<string, unknown>[]>;
  update?: (args: TAutomationSetPropertyUpdateArgs) => Promise<unknown>;
  triggerType?: string;
  targetType?: string;
}
export enum EXECUTE_WAIT_TYPES {
  DELAY = 'delay',
  IS_IN_SEGMENT = 'isInSegment',
  CHECK_OBJECT = 'checkObject',
  WEBHOOK = 'webhook',
}

export type TAutomationExecutionDelay = {
  subdomain: string;
  waitFor: number;
  timeUnit: 'minute' | 'hour' | 'day' | 'month' | 'year';
  startWaitingDate?: Date;
};

export type TAutomationExecutionCheckObject = {
  contentType?: string;
  shouldCheckOptionalConnect?: boolean;
  targetId?: string;
  expectedState: Record<string, any>;
  propertyName: string;
  expectedStateConjunction?: 'every' | 'some';
  timeout?: Date;
};

export type TAutomationExecutionIsInSegment = {
  targetId: string;
  segmentId: string;
};

export type TAutomationExecutionWebhook = {
  endpoint: string;
  secret?: string;
  schema: any;
};

export type AutomationExecutionSetWaitCondition =
  | ({
      type: EXECUTE_WAIT_TYPES.DELAY;
    } & TAutomationExecutionDelay)
  | ({
      type: EXECUTE_WAIT_TYPES.CHECK_OBJECT;
    } & TAutomationExecutionCheckObject)
  | ({
      type: EXECUTE_WAIT_TYPES.IS_IN_SEGMENT;
    } & TAutomationExecutionIsInSegment)
  | ({
      type: EXECUTE_WAIT_TYPES.WEBHOOK;
    } & TAutomationExecutionWebhook);

export enum TAutomationProducers {
  RECEIVE_ACTIONS = 'receiveActions',
  RESOLVE_OUTPUT_PATHS = 'resolveOutputPaths',
  CHECK_CUSTOM_TRIGGER = 'checkCustomTrigger',
  CHECK_TARGET_MATCH = 'checkTargetMatch',
  FIND_OBJECT = 'findObject',
  SET_PROPERTIES = 'setProperties',
  GENERATE_AI_CONTEXT = 'generateAiContext',
}

export enum TAutomationActionFolks {
  DEFAULT = 'default',
  SUCCESS = 'success',
  ERROR = 'error',
}
