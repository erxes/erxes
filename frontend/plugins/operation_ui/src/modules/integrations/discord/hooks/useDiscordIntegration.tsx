import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import {
  CHECK_DISCORD_TOKEN,
  GET_DISCORD_CHANNELS,
  GET_DISCORD_CONFIG_BY_TEAM,
  GET_DISCORD_CONNECTIONS,
} from '../graphql/queries/discordQueries';
import {
  CONNECT_DISCORD,
  DISCONNECT_DISCORD,
  DISCONNECT_DISCORD_TEAM,
  SAVE_DISCORD_TEAM_CONFIG,
  SEND_DISCORD_TEST_MESSAGE,
} from '../graphql/mutations/discordMutations';

type TMutationCallbacks = {
  onCompleted: () => void;
  onError: (error: Error) => void;
};

export function useDiscordConnections() {
  const { data, loading, error, refetch } = useQuery(GET_DISCORD_CONNECTIONS, {
    fetchPolicy: 'network-only',
  });

  return {
    connections: data?.operationDiscordConnections ?? [],
    configs: data?.operationDiscordConfigs ?? [],
    loading,
    error,
    refetch,
  };
}

export function useDiscordTokenCheck() {
  const [checkToken, { data, loading, error, called }] = useLazyQuery(
    CHECK_DISCORD_TOKEN,
    { fetchPolicy: 'no-cache' },
  );

  return {
    checkToken,
    result: called ? data?.operationDiscordCheckToken : undefined,
    checking: loading,
    error,
  };
}

export function useDiscordChannels(connectionId: string, skip?: boolean) {
  const { data, loading, error } = useQuery(GET_DISCORD_CHANNELS, {
    variables: { connectionId },
    fetchPolicy: 'network-only',
    skip: skip || !connectionId,
  });

  return {
    channels: data?.operationDiscordChannels ?? [],
    loading,
    error,
  };
}

export function useDiscordConfigByTeam(teamId: string) {
  const { data, loading, error, refetch } = useQuery(
    GET_DISCORD_CONFIG_BY_TEAM,
    {
      variables: { teamId },
      fetchPolicy: 'network-only',
      skip: !teamId,
    },
  );

  return {
    config: data?.operationDiscordConfigByTeam,
    loading,
    error,
    refetch,
  };
}

export function useConnectDiscord({
  onCompleted,
  onError,
}: TMutationCallbacks) {
  const [connectDiscord, { loading: connecting }] = useMutation(
    CONNECT_DISCORD,
    {
      onCompleted,
      onError,
      refetchQueries: [{ query: GET_DISCORD_CONNECTIONS }],
      awaitRefetchQueries: true,
    },
  );

  return { connectDiscord, connecting };
}

export function useDisconnectDiscord({
  onCompleted,
  onError,
}: TMutationCallbacks) {
  const [disconnectDiscord, { loading: disconnecting }] = useMutation(
    DISCONNECT_DISCORD,
    {
      onCompleted,
      onError,
      refetchQueries: [{ query: GET_DISCORD_CONNECTIONS }],
      awaitRefetchQueries: true,
    },
  );

  return { disconnectDiscord, disconnecting };
}

export function useSaveDiscordTeamConfig(
  teamId: string,
  { onCompleted, onError }: TMutationCallbacks,
) {
  const [saveTeamConfig, { loading: saving }] = useMutation(
    SAVE_DISCORD_TEAM_CONFIG,
    {
      onCompleted,
      onError,
      refetchQueries: [
        { query: GET_DISCORD_CONFIG_BY_TEAM, variables: { teamId } },
        { query: GET_DISCORD_CONNECTIONS },
      ],
      awaitRefetchQueries: true,
    },
  );

  return { saveTeamConfig, saving };
}

export function useDisconnectDiscordTeam(
  teamId: string,
  { onCompleted, onError }: TMutationCallbacks,
) {
  const [disconnectTeam, { loading: disconnecting }] = useMutation(
    DISCONNECT_DISCORD_TEAM,
    {
      onCompleted,
      onError,
      refetchQueries: [
        { query: GET_DISCORD_CONFIG_BY_TEAM, variables: { teamId } },
        { query: GET_DISCORD_CONNECTIONS },
      ],
      awaitRefetchQueries: true,
    },
  );

  return { disconnectTeam, disconnecting };
}

export function useSendDiscordTestMessage({
  onCompleted,
  onError,
}: TMutationCallbacks) {
  const [sendTestMessage, { loading: sending }] = useMutation(
    SEND_DISCORD_TEST_MESSAGE,
    { onCompleted, onError },
  );

  return { sendTestMessage, sending };
}
