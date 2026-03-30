import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import { TMessageTriggerCondition } from './messageTrigger';

export type TTriggerConfigContentConfig = {
  botId: string;
  conditions: TMessageTriggerCondition[];
};

export type TTriggerConditionSummaryItem = {
  _id: string;
  type: string;
  label: string;
  description: string;
  value: string;
};

export type TTriggerConfigSummaryResult = {
  bot?: IFacebookBot;
  loading: boolean;
  conditionSummaries: TTriggerConditionSummaryItem[];
};
