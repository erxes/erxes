import { useEffect, useRef } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { REACT_APP_API_URL } from 'erxes-ui';
import {
  GET_DISCORD_CONNECTIONS,
  GET_DISCORD_MY_ACCOUNT,
  GET_DISCORD_OAUTH_REDIRECT_URI,
  GET_DISCORD_TEAM_MEMBERS,
} from '../graphql/queries/discordQueries';
import {
  CLEAR_DISCORD_CLIENT_SECRET,
  REMIND_DISCORD_MEMBER,
  SET_DISCORD_CLIENT_SECRET,
  START_DISCORD_ACCOUNT_LINK,
  UNLINK_DISCORD_MEMBER,
  UNLINK_MY_DISCORD_ACCOUNT,
} from '../graphql/mutations/discordMutations';
import {
  DISCORD_LINK_MESSAGE_TYPE,
  DISCORD_LINK_POPUP_FEATURES,
} from '../constants';
import { TDiscordLinkMessage } from '../types';

type TMutationCallbacks = {
  onCompleted: () => void;
  onError: (error: Error) => void;
};

const ACCOUNT_QUERIES = [GET_DISCORD_MY_ACCOUNT, GET_DISCORD_TEAM_MEMBERS];

const LINK_PENDING_MS = 10 * 60 * 1000;

const getOrigin = (url: string) => {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
};

const isTrustedOrigin = (origin: string) =>
  origin === window.location.origin || origin === getOrigin(REACT_APP_API_URL);

const isDiscordLinkMessage = (data: unknown): data is TDiscordLinkMessage =>
  typeof data === 'object' &&
  data !== null &&
  'type' in data &&
  data.type === DISCORD_LINK_MESSAGE_TYPE &&
  'ok' in data &&
  typeof data.ok === 'boolean' &&
  'message' in data &&
  typeof data.message === 'string';

export function useDiscordMyAccount() {
  const { data, loading, error } = useQuery(GET_DISCORD_MY_ACCOUNT, {
    fetchPolicy: 'network-only',
  });

  return {
    account: data?.operationDiscordMyAccount,
    loading,
    error,
  };
}

export function useDiscordOAuthRedirectUri(skip?: boolean) {
  const { data, loading, error } = useQuery(GET_DISCORD_OAUTH_REDIRECT_URI, {
    skip,
  });

  return {
    redirectUri: data?.operationDiscordOAuthRedirectUri ?? '',
    loading,
    error,
  };
}

export function useDiscordTeamMembers(teamId: string) {
  const { data, loading, error } = useQuery(GET_DISCORD_TEAM_MEMBERS, {
    variables: { teamId },
    fetchPolicy: 'network-only',
    skip: !teamId,
  });

  return {
    members: data?.operationDiscordTeamMembers ?? [],
    loading,
    error,
  };
}

export function useSetDiscordClientSecret({
  onCompleted,
  onError,
}: TMutationCallbacks) {
  const [setClientSecret, { loading: saving }] = useMutation(
    SET_DISCORD_CLIENT_SECRET,
    {
      onCompleted,
      onError,
      refetchQueries: [
        { query: GET_DISCORD_CONNECTIONS },
        { query: GET_DISCORD_MY_ACCOUNT },
      ],
      awaitRefetchQueries: true,
    },
  );

  return { setClientSecret, saving };
}

export function useClearDiscordClientSecret({
  onCompleted,
  onError,
}: TMutationCallbacks) {
  const [clearClientSecret, { loading: clearing }] = useMutation(
    CLEAR_DISCORD_CLIENT_SECRET,
    {
      onCompleted,
      onError,
      refetchQueries: [
        { query: GET_DISCORD_CONNECTIONS },
        { query: GET_DISCORD_MY_ACCOUNT },
      ],
      awaitRefetchQueries: true,
    },
  );

  return { clearClientSecret, clearing };
}

export function useUnlinkMyDiscordAccount({
  onCompleted,
  onError,
}: TMutationCallbacks) {
  const [unlinkMyAccount, { loading: unlinking }] = useMutation(
    UNLINK_MY_DISCORD_ACCOUNT,
    {
      onCompleted,
      onError,
      refetchQueries: ACCOUNT_QUERIES,
      awaitRefetchQueries: true,
    },
  );

  return { unlinkMyAccount, unlinking };
}

export function useUnlinkDiscordMember(
  teamId: string,
  { onCompleted, onError }: TMutationCallbacks,
) {
  const [unlinkMember, { loading: unlinking }] = useMutation(
    UNLINK_DISCORD_MEMBER,
    {
      onCompleted,
      onError,
      refetchQueries: [
        { query: GET_DISCORD_TEAM_MEMBERS, variables: { teamId } },
        { query: GET_DISCORD_MY_ACCOUNT },
      ],
      awaitRefetchQueries: true,
    },
  );

  return { unlinkMember, unlinking };
}

export function useRemindDiscordMember({
  onCompleted,
  onError,
}: TMutationCallbacks) {
  const [remindMember, { loading: reminding }] = useMutation(
    REMIND_DISCORD_MEMBER,
    { onCompleted, onError },
  );

  return { remindMember, reminding };
}

export function useDiscordAccountLinkPopup({
  onLinked,
  onError,
}: {
  onLinked: (message: string) => void;
  onError: (message: string) => void;
}) {
  const apolloClient = useApolloClient();
  const callbacks = useRef({ onLinked, onError });
  const pendingUntil = useRef(0);
  const [startAccountLink, { loading: starting }] = useMutation(
    START_DISCORD_ACCOUNT_LINK,
  );

  useEffect(() => {
    callbacks.current = { onLinked, onError };
  }, [onLinked, onError]);

  useEffect(() => {
    const refetchAccount = () =>
      apolloClient.refetchQueries({ include: ACCOUNT_QUERIES });

    const handleMessage = (event: MessageEvent) => {
      if (!isTrustedOrigin(event.origin) || !isDiscordLinkMessage(event.data)) {
        return;
      }

      const { ok, message } = event.data;

      pendingUntil.current = 0;

      void refetchAccount().finally(() =>
        ok
          ? callbacks.current.onLinked(message)
          : callbacks.current.onError(message),
      );
    };

    const handleFocus = () => {
      if (pendingUntil.current > Date.now()) {
        void refetchAccount();
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('focus', handleFocus);
    };
  }, [apolloClient]);

  async function openAccountLink() {
    const popup = window.open(
      '',
      'operation-discord-account-link',
      DISCORD_LINK_POPUP_FEATURES,
    );

    try {
      const { data } = await startAccountLink();
      const url = data?.operationDiscordStartAccountLink;

      if (!url) {
        throw new Error('Could not start the Discord sign-in');
      }

      if (!popup) {
        window.location.assign(url);
        return;
      }

      pendingUntil.current = Date.now() + LINK_PENDING_MS;
      popup.location.href = url;

      const timer = window.setInterval(() => {
        if (popup.closed) {
          window.clearInterval(timer);
          void apolloClient.refetchQueries({ include: ACCOUNT_QUERIES });
        }
      }, 500);
    } catch (error) {
      popup?.close();
      callbacks.current.onError(
        error instanceof Error
          ? error.message
          : 'Could not start the Discord sign-in',
      );
    }
  }

  return { openAccountLink, starting };
}
