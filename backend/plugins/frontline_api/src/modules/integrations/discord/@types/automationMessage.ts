import {
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

export type TReceiveActionInput =
  TAutomationProducersInput[TAutomationProducers.RECEIVE_ACTIONS];

export type TSendDiscordMessageParams = {
  models: IModels;
  subdomain: string;
  action: TReceiveActionInput['action'];
  execution: TReceiveActionInput['execution'];
};

// Where the message goes:
//  - conversation: reply into the triggering conversation's channel (default)
//  - channel:      a specific channel of a chosen bot
//  - dm:           a direct message to a chosen user, via a chosen bot
export type TDiscordTarget = 'conversation' | 'channel' | 'dm';

export type TDiscordButton = { label?: string; url?: string };

export type TDiscordEmbed = {
  title?: string;
  description?: string;
  url?: string;
  color?: string;
  imageUrl?: string;
};
