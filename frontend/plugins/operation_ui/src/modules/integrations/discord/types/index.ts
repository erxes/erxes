import {
  OperationDiscordChannelsQuery,
  OperationDiscordCheckTokenQuery,
  OperationDiscordConfigByTeamQuery,
  OperationDiscordConnectionsQuery,
  OperationDiscordMyAccountQuery,
  OperationDiscordNotificationEvent,
  OperationDiscordTeamMembersQuery,
} from '~/gql/graphql';

export type IDiscordConnection =
  OperationDiscordConnectionsQuery['operationDiscordConnections'][number];

export type IDiscordConfigSummary =
  OperationDiscordConnectionsQuery['operationDiscordConfigs'][number];

export type IDiscordConfig = NonNullable<
  OperationDiscordConfigByTeamQuery['operationDiscordConfigByTeam']
>;

export type IDiscordChannel =
  OperationDiscordChannelsQuery['operationDiscordChannels'][number];

export type IDiscordTokenCheck =
  OperationDiscordCheckTokenQuery['operationDiscordCheckToken'];

export type TDiscordNotificationEvent = OperationDiscordNotificationEvent;

export type IDiscordAccount =
  OperationDiscordMyAccountQuery['operationDiscordMyAccount'];

export type IDiscordUserLink = NonNullable<IDiscordAccount['link']>;

export type IDiscordTeamMember =
  OperationDiscordTeamMembersQuery['operationDiscordTeamMembers'][number];

export type TDiscordLinkMessage = {
  type: string;
  ok: boolean;
  message: string;
};

export interface ConnectDiscordDialogProps {
  open: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export interface TeamDiscordDialogProps {
  open: boolean;
  onClose: () => void;
  teamId: string;
  connections: IDiscordConnection[];
  currentConfig?: IDiscordConfig | null;
}
