import {
  IAutomationAction,
  IAutomationExecution,
  IAutomationTrigger,
} from '../../../core-modules/automations/definitions';

export type ICheckTriggerData = {
  collectionType: string;
  automationId: string;
  trigger: IAutomationTrigger;
  target: any;
  config: any;
};

export type IReplacePlaceholdersData<TTarget = any> = {
  target: TTarget;
  config: any;
  relatedValueProps: any;
};

export type IAutomationWorkerContext<TModels = any> = {
  models: TModels;
  subdomain: string;
};

export type IAutomationReceiveActionData = {
  action: IAutomationAction;
  execution: { _id: string } & IAutomationExecution;
  actionType: string;
  collectionType: string;
  triggerType: string;
};
