import type {
  CallAddCustomerMutation,
  CallConversationNotesQuery,
  CallUserIntegrationsQuery,
} from '~/gql/graphql';

export type ICallConfig = NonNullable<
  NonNullable<CallUserIntegrationsQuery['callUserIntegrations']>[number]
>;

export type ICallConfigDoc = ICallConfig & {
  isAvailable: boolean;
};

export interface ICallQueueAgent {
  member_extension: string;
  status?: string;
  first_name?: string;
  last_name?: string;
  membership?: string;
  answer?: number;
  abandon?: number;
  logintime?: string;
  talktime?: number;
  pausetime?: string;
  pause_reason?: string;
  queue_action?: string;
}

export interface ICallQueueRealtimeSnapshot {
  extension: string;
  waiting: { callerid: string; callerchannel?: string; state?: string }[];
  talking: {
    callerid: string;
    calleeid?: string;
    bridged?: boolean;
    bridge_time?: string;
  }[];
  agents: ICallQueueAgent[];
  stats: Record<string, unknown>;
}

type CallAddCustomerResult = NonNullable<
  CallAddCustomerMutation['callAddCustomer']
>;

export type ICallConversationNote = NonNullable<
  NonNullable<CallConversationNotesQuery['callConversationNotes']>[number]
>;

export type ICustomer = NonNullable<CallAddCustomerResult['customer']>;

export type ICallChannels = CallAddCustomerResult['channels'];

export type ITag = NonNullable<NonNullable<ICustomer['getTags']>[number]>;
