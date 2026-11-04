import {
  OperationDiscordChannelsQuery,
  OperationDiscordCheckTokenQuery,
  OperationDiscordConfigsByTeamQuery,
  OperationDiscordConnectionsQuery,
  OperationDiscordCustomerChannelsQuery,
  OperationDiscordMention,
  OperationDiscordMyAccountQuery,
  OperationDiscordNotificationEvent,
  OperationDiscordTeamMembersQuery,
} from '~/gql/graphql';

export type IDiscordConnection =
  OperationDiscordConnectionsQuery['operationDiscordConnections'][number];

export type IDiscordConfigSummary =
  OperationDiscordConnectionsQuery['operationDiscordConfigs'][number];

export type IDiscordConfig =
  OperationDiscordConfigsByTeamQuery['operationDiscordConfigsByTeam'][number];

export type IDiscordChannel =
  OperationDiscordChannelsQuery['operationDiscordChannels'][number];

export type IDiscordTokenCheck =
  OperationDiscordCheckTokenQuery['operationDiscordCheckToken'];

export type TDiscordNotificationEvent = OperationDiscordNotificationEvent;

export type TDiscordMention = OperationDiscordMention;

export type IDiscordAccount =
  OperationDiscordMyAccountQuery['operationDiscordMyAccount'];

export type IDiscordUserLink = NonNullable<IDiscordAccount['link']>;

export type IDiscordTeamMember =
  OperationDiscordTeamMembersQuery['operationDiscordTeamMembers'][number];

export type IDiscordCustomerChannel =
  OperationDiscordCustomerChannelsQuery['operationDiscordCustomerChannels'][number];

export type TDiscordLinkMessage = {
  type: string;
  ok: boolean;
  message: string;
};

export interface ConnectDiscordSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection?: IDiscordConnection;
  onConnected?: () => void;
}

export interface TeamDiscordSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  connections: IDiscordConnection[];
  currentConfig?: IDiscordConfig | null;
  takenChannelIds?: readonly string[];
  githubRepoName?: string;
}

export type TDiscordServerRow = IDiscordConnection & {
  teamCount: number;
  customerChannelCount: number;
};

export type TDiscordCustomerChannelRow = IDiscordCustomerChannel & {
  connection?: IDiscordConnection;
};
