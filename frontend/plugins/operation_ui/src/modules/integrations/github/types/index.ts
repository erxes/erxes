import {
  OperationGithubConfigByTeamQuery,
  OperationGithubConnectionsQuery,
  OperationGithubRepositoriesQuery,
} from '~/gql/graphql';

export type IGithubConnection = NonNullable<
  OperationGithubConnectionsQuery['getGithubConnections']
>[number];

export type IGithubConfig = NonNullable<
  OperationGithubConfigByTeamQuery['getAllGithubConfigs']
>[number];

export type IGithubRepository = NonNullable<
  NonNullable<OperationGithubRepositoriesQuery['getGithubRepositories']>[number]
>;

export interface LinkRepoDialogProps {
  open: boolean;
  onClose: () => void;
  teamId: string;
  connections: IGithubConnection[];
  currentConfig?: IGithubConfig | null;
  linkedRepoNames: string[];
  onSaved: () => void;
  onInstallOrganization: () => void;
}
