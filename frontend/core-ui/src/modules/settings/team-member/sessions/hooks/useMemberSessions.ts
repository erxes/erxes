import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  USER_SESSIONS,
  USERS_REVOKE_SESSIONS,
} from '@/settings/team-member/sessions/graphql';
import { IUserSession } from '@/settings/team-member/sessions/types';

export const useMemberSessions = (userId: string) => {
  const { data, loading, error } = useQuery<{ userSessions: IUserSession[] }>(
    USER_SESSIONS,
    { variables: { _id: userId }, skip: !userId, fetchPolicy: 'network-only' },
  );

  return { sessions: data?.userSessions ?? [], loading, error };
};

/** Ends one session, or every session when no id is given. */
export const useRevokeMemberSessions = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [mutate, { loading }] = useMutation<
    { usersRevokeSessions: boolean },
    { _id: string; sessionId?: string }
  >(USERS_REVOKE_SESSIONS, { refetchQueries: [USER_SESSIONS] });

  const revoke = (userId: string, sessionId?: string, onDone?: () => void) =>
    mutate({
      variables: { _id: userId, ...(sessionId ? { sessionId } : {}) },
      onCompleted: () => {
        toast({
          title: t(sessionId ? 'session-signed-out' : 'sessions-signed-out'),
          variant: 'success',
        });
        onDone?.();
      },
      onError: (e) => toast({ title: e.message, variant: 'destructive' }),
    });

  return { revoke, loading };
};
