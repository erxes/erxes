import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import { TCommentTriggerForm } from './commentTrigger';
import { TMessageTriggerCondition } from './messageTrigger';

export type TMessageTriggerConfigContentConfig = {
  botId: string;
  conditions: TMessageTriggerCondition[];
};

export type TCommentTriggerConfigContentConfig = TCommentTriggerForm;

export type TTriggerConfigContentConfig =
  | TMessageTriggerConfigContentConfig
  | TCommentTriggerConfigContentConfig;

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
