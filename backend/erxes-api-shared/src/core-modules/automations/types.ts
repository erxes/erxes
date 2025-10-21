import {
  IAutomationAction,
  IAutomationTrigger,
  IAutomationExecution,
} from './definitions';

export type IAutomationContext = {
  subdomain: string;
  processId?: string;
};

export type IAutomationsTriggerConfig = {
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
  connectableActionTypes?: string[];
};

export type IAutomationsActionConfig = {
  type: string;
  icon: string;
  label: string;
  description: string;
  isAvailableOptionalConnect?: boolean;
  emailRecipientsConst?: any;
  connectableActionTypes?: string[];
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

export interface AutomationWorkers {
  receiveActions?: (
    context: IAutomationContext,
    args: {
      moduleName: string;
      collectionType: string;
      actionType: string;
      triggerType: string;
      action: IAutomationAction;
      execution: { _id: string } & IAutomationExecution;
    },
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

  getRecipientsEmails?: (
    context: IAutomationContext,
    args: any,
  ) => Promise<any>;
  replacePlaceHolders?: (
    context: IAutomationContext,
    args: any,
  ) => Promise<any>;
  checkCustomTrigger?: <TTarget = any, TConfig = any>(
    context: IAutomationContext,
    args: {
      moduleName: string;
      collectionType: string;
      automationId: string;
      trigger: IAutomationTrigger;
      target: TTarget;
      config: TConfig;
    },
  ) => Promise<boolean>;
}

export interface AutomationConfigs extends AutomationWorkers {
  constants: AutomationConstants;
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
  secret: string;
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
  GET_RECIPIENTS_EMAILS = 'getRecipientsEmails',
  REPLACE_PLACEHOLDERS = 'replacePlaceHolders',
  CHECK_CUSTOM_TRIGGER = 'checkCustomTrigger',
}
