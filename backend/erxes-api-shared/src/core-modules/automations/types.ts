import { IAction, ITrigger, IAutomationExecution } from './definitions';

type IContext = {
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
    context: IContext,
    args: {
      moduleName: string;
      collectionType: string;
      actionType: string;
      triggerType: string;
      action: IAction;
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

  getRecipientsEmails?: (context: IContext, args: any) => Promise<any>;
  replacePlaceHolders?: (context: IContext, args: any) => Promise<any>;
  checkCustomTrigger?: <TTarget = any, TConfig = any>(
    context: IContext,
    args: {
      moduleName: string;
      collectionType: string;
      automationId: string;
      trigger: ITrigger;
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

export type AutomationExecutionSetWaitCondition =
  | {
      type: 'delay';
      subdomain: string;
      waitFor: number;
      timeUnit: 'minute' | 'hour' | 'day' | 'month' | 'year';
      startWaitingDate?: Date;
    }
  | {
      type: 'checkObject';
      contentType?: string;
      shouldCheckOptionalConnect?: boolean;
      targetId?: string;
      expectedState: Record<string, any>;
      propertyName: string;
      expectedStateConjunction?: 'every' | 'some';
      timeout?: Date;
    }
  | { type: 'isInSegment'; targetId: string; segmentId: string };
