import { useMutation, useQuery } from '@apollo/client';
import { OperationDiscordEnableCommandsMutation } from '~/gql/graphql';
import {
  GET_DISCORD_CONNECTIONS,
  GET_DISCORD_CUSTOMER_CHANNELS,
} from '../graphql/queries/discordQueries';
import {
  DISABLE_DISCORD_COMMANDS,
  ENABLE_DISCORD_COMMANDS,
  REMOVE_DISCORD_CUSTOMER_CHANNEL,
  SAVE_DISCORD_CUSTOMER_CHANNEL,
} from '../graphql/mutations/discordMutations';

type TMutationCallbacks = {
  onCompleted: () => void;
  onError: (error: Error) => void;
};

export function useEnableDiscordCommands({
  onCompleted,
  onError,
}: {
  onCompleted: (data: OperationDiscordEnableCommandsMutation) => void;
  onError: (error: Error) => void;
}) {
  const [enableCommands, { loading: enabling }] = useMutation(
    ENABLE_DISCORD_COMMANDS,
    { onCompleted, onError },
  );

  return { enableCommands, enabling };
}

export function useDisableDiscordCommands({
  onCompleted,
  onError,
}: TMutationCallbacks) {
  const [disableCommands, { loading: disabling }] = useMutation(
    DISABLE_DISCORD_COMMANDS,
    { onCompleted, onError },
  );

  return { disableCommands, disabling };
}

export function useDiscordCustomerChannels() {
  const { data, loading, error } = useQuery(GET_DISCORD_CUSTOMER_CHANNELS, {
    fetchPolicy: 'network-only',
  });

  return {
    customerChannels: data?.operationDiscordCustomerChannels ?? [],
    loading,
    error,
  };
}

export function useSaveDiscordCustomerChannel({
  onCompleted,
  onError,
}: TMutationCallbacks) {
  const [saveCustomerChannel, { loading: saving }] = useMutation(
    SAVE_DISCORD_CUSTOMER_CHANNEL,
    {
      onCompleted,
      onError,
      refetchQueries: [
        { query: GET_DISCORD_CUSTOMER_CHANNELS },
        { query: GET_DISCORD_CONNECTIONS },
      ],
      awaitRefetchQueries: true,
    },
  );

  return { saveCustomerChannel, saving };
}

export function useRemoveDiscordCustomerChannel({
  onCompleted,
  onError,
}: TMutationCallbacks) {
  const [removeCustomerChannel, { loading: removing }] = useMutation(
    REMOVE_DISCORD_CUSTOMER_CHANNEL,
    {
      onCompleted,
      onError,
      refetchQueries: [{ query: GET_DISCORD_CUSTOMER_CHANNELS }],
      awaitRefetchQueries: true,
    },
  );

  return { removeCustomerChannel, removing };
}
