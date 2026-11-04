import { useEffect, useRef } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { useSearchParams } from 'react-router-dom';
import {
  GET_DISCORD_CONNECTIONS,
  GET_DISCORD_MY_ACCOUNT,
  GET_DISCORD_OAUTH_REDIRECT_URI,
  GET_DISCORD_TEAM_MEMBERS,
} from '../graphql/queries/discordQueries';
import {
  CONFIRM_DISCORD_ACCOUNT_LINK,
  REMIND_DISCORD_MEMBER,
  SET_DISCORD_CLIENT_SECRET,
  SET_DISCORD_MEMBER_LINKING,
  START_DISCORD_ACCOUNT_LINK,
  UNLINK_DISCORD_MEMBER,
  UNLINK_MY_DISCORD_ACCOUNT,
} from '../graphql/mutations/discordMutations';
import {
  DISCORD_LINK_ERROR_MESSAGES,
  DISCORD_LINK_ERROR_PARAM,
  DISCORD_LINK_MESSAGE_TYPE,
  DISCORD_LINK_POPUP_FEATURES,
  DISCORD_LINK_RESULT_PARAM,
} from '../constants';
import { TDiscordLinkMessage } from '../types';
import { OperationDiscordSetMemberLinkingMutation } from '~/gql/graphql';

type TMutationCallbacks = {
  onCompleted: () => void;
  onError: (error: Error) => void;
};

const ACCOUNT_QUERIES = [GET_DISCORD_MY_ACCOUNT, GET_DISCORD_TEAM_MEMBERS];

const LINK_PENDING_MS = 10 * 60 * 1000;

const isWindow = (value: unknown): value is Window =>
  typeof value === 'object' && value !== null && 'postMessage' in value;

const getLinkOpener = () => {
  const opener: unknown = window.opener;

  try {
    return isWindow(opener) &&
      !opener.closed &&
      opener.location.origin === window.location.origin
      ? opener
      : null;
  } catch {
    return null;
  }
};

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

export function useSetDiscordMemberLinking({
  onCompleted,
  onError,
}: {
  onCompleted: (data: OperationDiscordSetMemberLinkingMutation) => void;
  onError: (error: Error) => void;
}) {
  const [setMemberLinking, { loading: switching }] = useMutation(
    SET_DISCORD_MEMBER_LINKING,
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

  return { setMemberLinking, switching };
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
  const handledReturn = useRef(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const linkToken = searchParams.get(DISCORD_LINK_RESULT_PARAM);
  const linkError = searchParams.get(DISCORD_LINK_ERROR_PARAM);
  const [startAccountLink, { loading: starting }] = useMutation(
    START_DISCORD_ACCOUNT_LINK,
  );
  const [confirmAccountLink] = useMutation(CONFIRM_DISCORD_ACCOUNT_LINK, {
    refetchQueries: ACCOUNT_QUERIES,
    awaitRefetchQueries: true,
  });

  useEffect(() => {
    callbacks.current = { onLinked, onError };
  }, [onLinked, onError]);

  useEffect(() => {
    if (handledReturn.current || (!linkToken && !linkError)) {
      return;
    }

    handledReturn.current = true;

    setSearchParams(
      (params) => {
        params.delete(DISCORD_LINK_RESULT_PARAM);
        params.delete(DISCORD_LINK_ERROR_PARAM);
        return params;
      },
      { replace: true },
    );

    const report = (ok: boolean, message: string) => {
      const opener = getLinkOpener();

      if (opener) {
        opener.postMessage(
          { type: DISCORD_LINK_MESSAGE_TYPE, ok, message },
          window.location.origin,
        );
        window.close();
        return;
      }

      if (ok) {
        callbacks.current.onLinked(message);
      } else {
        callbacks.current.onError(message);
      }
    };

    if (!linkToken) {
      report(
        false,
        DISCORD_LINK_ERROR_MESSAGES[linkError ?? ''] ??
          DISCORD_LINK_ERROR_MESSAGES.failed,
      );
      return;
    }

    confirmAccountLink({ variables: { token: linkToken } })
      .then(({ data }) => {
        const link = data?.operationDiscordConfirmAccountLink;

        report(
          true,
          `Linked the Discord account ${
            link?.globalName || link?.username || ''
          }.`,
        );
      })
      .catch((error: Error) => report(false, error.message));
  }, [confirmAccountLink, linkError, linkToken, setSearchParams]);

  useEffect(() => {
    const refetchAccount = () =>
      apolloClient.refetchQueries({ include: ACCOUNT_QUERIES });

    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        !isDiscordLinkMessage(event.data)
      ) {
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
