import { z } from 'zod';
import {
  BaseInput,
  CheckCustomTriggerInput,
  ReceiveActionsInput,
  ReplacePlaceholdersInput,
  SetPropertiesInput,
} from './zodTypes';

export type IAutomationContext = {
  subdomain: string;
  processId?: string;
};

export type IAutomationsTriggerConfig = {
  moduleName: string;
  collectionName: string;
  relationType?: string;
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

export type IAutomationsActionConfigFolkConfig = {
  key: string;
  label: string;
  type: TAutomationActionFolks;
};

export type IAutomationsActionConfig = {
  moduleName: string;
  collectionName: string;
  method?: 'create';
  icon: string;
  label: string;
  description: string;
  isAvailableOptionalConnect?: boolean;
  emailRecipientsConst?: any;
  isTargetSource?: boolean;
  targetSourceType?: string;
  allowTargetFromActions?: boolean;
  folks?: IAutomationsActionConfigFolkConfig[];
};

export type IAutomationsBotsConfig = {
  moduleName: string;
  name: string;
  label: string;
  description: string;
  logo: string;
  totalCountQueryName: string;
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

  getAdditionalAttributes?: (
    args: z.infer<typeof BaseInput>,
    context: IAutomationContext,
  ) => Promise<Array<TAutomationAdditionalAttribute>>;

  replacePlaceHolders?: (
    args: z.infer<typeof ReplacePlaceholdersInput>,
    context: IAutomationContext,
  ) => Promise<any>;
  checkCustomTrigger?: <TTarget = any, TConfig = any>(
    args: z.infer<typeof CheckCustomTriggerInput>,
    context: IAutomationContext,
  ) => Promise<boolean>;

  setProperties?: (
    args: z.infer<typeof SetPropertiesInput>,
    context: IAutomationContext,
  ) => Promise<{ module: string; fields: string; result: any[] }>;
}

export interface AutomationConfigs extends AutomationProducers {
  constants?: AutomationConstants;
}

export interface IReplacePlaceholdersProps<TModels> {
  models: TModels;
  subdomain: string;
  actionData: Record<string, any>;
  target: Record<string, any>;
  customResolver?: {
    isRelated?: boolean;
    resolver?: (
      models: TModels,
      subdomain: string,
      referenceObject: any,
      placeholderKey: string,
      props: any,
    ) => Promise<any>;
    props?: any;
  };
  complexFields?: string[];
}

export interface IPerValueProps<TModels> {
  models: TModels;
  subdomain: string;
  relatedItem: any;
  rule: any;
  target: any;
  getRelatedValue: any;
  triggerType?: string;
  targetType?: string;
  serviceName?: string;
  execution: any;
}

type IPRopertyRule = {
  field: string;
  operator: string;
  value: any;
  forwardTo: any;
};

export interface IPropertyProps<TModels> {
  models: TModels;
  subdomain: string;
  module: string;
  rules: IPRopertyRule[];
  execution: any;
  getRelatedValue: any;
  relatedItems: any[];
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
  REPLACE_PLACEHOLDERS = 'replacePlaceHolders',
  CHECK_CUSTOM_TRIGGER = 'checkCustomTrigger',
  GET_ADDITIONAL_ATTRIBUTES = 'getAdditionalAttributes',
  SET_PROPERTIES = 'setProperties',
}

export enum TAutomationActionFolks {
  DEFAULT = 'default',
  SUCCESS = 'success',
  ERROR = 'error',
}
