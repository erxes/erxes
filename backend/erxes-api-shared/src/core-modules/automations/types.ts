import { z } from 'zod';
import {
  AutomationBaseInput,
  CheckCustomTriggerInput,
  FindObjectInput,
  LoadAiKnowledgeDocumentBatchInput,
  LookupAiToolInput,
  ReceiveActionsInput,
  ResolveOutputPathsInput,
  SetPropertiesInput,
} from './zodTypes';
import { IAutomationExecution } from './definitions';
import type { TKnowledgeDocument } from '../../utils/knowledge';

export type IAutomationContext = {
  subdomain: string;
  processId?: string;
};

export type TAutomationOutputVariable = {
  key: string;
  label: string;
  exposure?: 'placeholder' | 'reference';
  isLink?: boolean;
  field?: string;
  /** Plain sub-fields of an array/object value, resolved from the source itself (no reference lookup). */
  fields?: TAutomationOutputVariable[];
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
  source: 'target' | 'relation' | 'resolver' | 'targetField';
  cardinality: 'one' | 'many';
  sourceType?: string;
  relation?: {
    contentType: string;
    relatedContentType: string;
  };
  resolverKey?: string;
  targetPath?: string;
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

export type TDeferredMode = 'standby' | 'ignore';

// Set by the action author, not the end user: 'ignore' lets the flow continue
// while the work is queued, 'standby' pauses until the result is back.
export type IAutomationsDeferredConfig = {
  enable: boolean;
  mode: TDeferredMode;
  timeoutMinutes?: number;
};

// Returned by the owning plugin instead of a result: it queued the work and
// tells the engine whether the flow may carry on without it.
export type IAutomationDeferredMarker = {
  jobId: string;
  mode: TDeferredMode;
  timeoutMinutes?: number;
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
  allowedMultiTriggerTypes?: string[];
  /**
   * Target record types this action can operate on, named with the same
   * identifiers as trigger types. Declaring nothing means the action is
   * target-agnostic and any caller may use it.
   *
   * Callers that supply their own target (a broadcast enrolling customers, an
   * AI agent, a manual run) check what they supply against this, so an action
   * never needs a per-caller flag.
   */
  requiresTargetTypes?: string[];
  folks?: IAutomationsActionConfigFolkConfig[];
  output?: TAutomationRuntimeOutputDefinition;
  setPropertyTargets?: TAutomationSetPropertyTarget[];
  deferred?: IAutomationsDeferredConfig;
};

export type IAutomationsBotsConfig = {
  moduleName: string;
  name: string;
  label: string;
  description: string;
  logo: string;
  totalCountQueryName: string;
};

export type TAiKnowledgeSourceConfig = {
  key: string;
  label: string;
  moduleName: string;
  sourceSelector: 'remote-module' | 'local';
  // Off for collections too large to stream, e.g. customers.
  supportsFullScope?: boolean;
};

export type TAiToolConfig = {
  key: string;
  label: string;
  moduleName: string;
  input: string;
  output: string;
};

export type TAutomationAiConfig = {
  knowledgeSources?: TAiKnowledgeSourceConfig[];
  tools?: TAiToolConfig[];
};

export type TAiToolLookupResult = {
  toolKey: string;
  title: string;
  items: Record<string, unknown>[];
  summary?: string;
};

export type TAiKnowledgeDocumentBatchResult = {
  documents: TKnowledgeDocument[];
  totalCount: number;
  nextCursor?: string;
  hasMore: boolean;
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
  ai?: TAutomationAiConfig;
  /**
   * Flows shipped with the code, not created by a tenant. They exist from the
   * moment the plugin is deployed and are never written to a tenant database:
   * a copy is only materialized when someone installs one.
   */
  workflowTemplates?: TAutomationBuiltInTemplate[];
};

/**
 * A step of a built-in template.
 *
 * Addressed by `order` rather than by id: ids are generated per automation, so
 * a template that hardcoded them could never be installed twice. Installing
 * maps every order to a fresh id and rewrites the connections with it.
 */
export type TAutomationBuiltInTemplateStep = {
  order: number;
  type: string;
  label?: string;
  description?: string;
  icon?: string;
  config?: Record<string, any>;
  /**
   * What runs after this step: a plain chain (`2`), or the branch handles of a
   * step that has more than one output (`{ yes: 2, no: 3 }` for `if`,
   * `{ isExists: 2, notExists: 3 }` for `findObject`).
   */
  next?: number | Record<string, number>;
};

/**
 * Something the tenant must already have before a template can work — a bot, a
 * pipeline stage, an integration. The value is chosen once, while installing,
 * by a component the owning plugin provides: only that plugin knows what
 * counts as a valid candidate and how to list them.
 */
export type TAutomationBuiltInTemplateRequirement = {
  /** Unique within the template; how `dependsOn` refers to another one. */
  key: string;
  /** Resolved by the owning plugin's `templateRequirement` component. */
  kind: string;
  label: string;
  description?: string;
  /**
   * Where the chosen value lands in the flow. Omitted for a requirement that
   * only gates — something that must exist but fills nothing in.
   *
   * `from` names a field of the answer when the component reports an object
   * rather than a scalar, so one choice can settle everything it implies — an
   * address and the name that goes with it, a pipeline and its label.
   */
  fills?: { order: number; path: string; from?: string }[];
  /** Stays unanswerable until that requirement has a value (stage needs its pipeline). */
  dependsOn?: string;
};

export type TAutomationBuiltInTemplate = {
  /** Stable across deploys; how an installed copy still names its origin. */
  id: string;
  name: string;
  description?: string;
  flow: TAutomationBuiltInTemplateStep[];
  requirements?: TAutomationBuiltInTemplateRequirement[];
  /**
   * Fields the template deliberately leaves empty because only the
   * organization can write them — its own name in a signature, the wording of
   * an offer. Unlike a requirement these never block installing; they are
   * listed so the flow is not installed and then quietly left unfinished.
   */
  mustConfigure?: { order: number; label: string }[];
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

  loadAiKnowledgeDocumentBatch?: (
    args: z.infer<typeof LoadAiKnowledgeDocumentBatchInput>,
    context: IAutomationContext,
  ) => Promise<TAiKnowledgeDocumentBatchResult>;

  lookupAiTool?: (
    args: z.infer<typeof LookupAiToolInput>,
    context: IAutomationContext,
  ) => Promise<TAiToolLookupResult>;

  resolveOutputPaths?: (
    args: z.infer<typeof ResolveOutputPathsInput>,
    context: IAutomationContext,
  ) => Promise<Record<string, any>>;
  checkCustomTrigger?: (
    args: z.infer<typeof CheckCustomTriggerInput>,
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
  fallbackValue?: unknown;
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
  FIND_OBJECT = 'findObject',
  SET_PROPERTIES = 'setProperties',
  GENERATE_AI_CONTEXT = 'generateAiContext',
  LOAD_AI_KNOWLEDGE_DOCUMENT_BATCH = 'loadAiKnowledgeDocumentBatch',
  LOOKUP_AI_TOOL = 'lookupAiTool',
}

export enum TAutomationActionFolks {
  DEFAULT = 'default',
  SUCCESS = 'success',
  ERROR = 'error',
}
