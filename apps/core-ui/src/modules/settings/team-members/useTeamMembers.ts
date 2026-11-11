import type { User, UserRole, UserStatus } from '@erxes/core-contract';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMultiQueryState, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { api, messageOf } from '~/lib/api';
import { patchCachedRecord, useCursorList } from '~/lib/cursorList';
import { SESSION_KEY, useSession } from '~/modules/auth/session';
import { TEAM_MEMBER_CURSOR_SESSION_KEY } from './constants';

export const USERS_KEY = ['users'];
export const TEAM_MEMBERS_SESSION_KEY = TEAM_MEMBER_CURSOR_SESSION_KEY;

export type UserUpdate = Parameters<typeof api.users.update>[0];
export type InviteEntry = Parameters<typeof api.users.inviteMany>[0]['entries'][number];

export const ROLE_LABEL: Record<UserRole, string> = { owner: 'Owner', admin: 'Admin', member: 'Member' };
export const STATUS_LABEL: Record<UserStatus, string> = {
  active: 'Active',
  invited: 'Invited',
  disabled: 'Disabled',
};

/** First and last name as old core-ui shows them, else the stored full name, else the email. */
export const memberName = (user: Pick<User, 'firstName' | 'lastName' | 'fullName' | 'email'>) =>
  [user.firstName, user.lastName].filter(Boolean).join(' ') || user.fullName || user.email;

const detailKey = (id: string) => [...USERS_KEY, 'detail', id];

/** The list's filters (old `useTeamMemberVariables`): search, role and "Is active" (on unless switched off). */
export const useTeamMemberVariables = () => {
  const [{ searchValue, isActive, role }] = useMultiQueryState<{
    searchValue: string;
    isActive: boolean;
    role: UserRole;
  }>(['searchValue', 'isActive', 'role']);

  return {
    search: searchValue || undefined,
    isActive: isActive ?? true,
    role: role || undefined,
  };
};

export const useTeamMembers = () => {
  const filters = useTeamMemberVariables();

  return useCursorList<User>({
    queryKey: [...USERS_KEY, 'list', filters],
    sessionKey: TEAM_MEMBERS_SESSION_KEY,
    fetchPage: (params) => api.users.list({ ...params, ...filters }),
  });
};

/** One member (old `useUserDetail`). */
export const useTeamMember = (id: string | null) =>
  useQuery({
    queryKey: detailKey(id ?? ''),
    queryFn: () => api.users.get({ id: id ?? '' }),
    enabled: !!id,
    retry: false,
  });

/** Puts a changed member everywhere it is shown: lists, its detail and, for yourself, the session. */
const useStoreMember = () => {
  const client = useQueryClient();
  const { user: me } = useSession();

  return (user: User) => {
    patchCachedRecord(client, USERS_KEY, user);
    client.setQueryData(detailKey(user.id), user);

    if (user.id === me.id) {
      void client.invalidateQueries({ queryKey: SESSION_KEY });
    }
  };
};

/** Old `useUserEdit`: saves any member field, toasts on failure. */
export const useTeamMemberEdit = () => {
  const store = useStoreMember();
  const { toast } = useToast();
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  return useMutation({
    mutationFn: (input: UserUpdate) => api.users.update(input),
    onSuccess: store,
    onError: (error) =>
      toast({ variant: 'destructive', title: t('failed-to-update-user-details'), description: messageOf(error) }),
  });
};

export const useTeamMemberDisable = () => {
  const client = useQueryClient();
  const store = useStoreMember();
  const { toast } = useToast();
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  return useMutation({
    mutationFn: ({ id, disabled }: { id: string; disabled: boolean }) =>
      disabled ? api.users.disable({ id }) : api.users.enable({ id }),
    onSuccess: (user) => {
      store(user);
      // It leaves or joins the "Is active" list.
      void client.invalidateQueries({ queryKey: [...USERS_KEY, 'list'] });
      toast({
        variant: 'success',
        title: user.status === 'disabled' ? t('user-deactivated-successfully') : t('user-activated-successfully'),
      });
    },
    onError: (error) => toast({ variant: 'destructive', title: t('error'), description: messageOf(error) }),
  });
};

/** Disables several members (command bar); resolves with how many were disabled. */
export const useTeamMembersDeactivate = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(ids.map((id) => api.users.disable({ id })));
      const failed = results.find((result): result is PromiseRejectedResult => result.status === 'rejected');

      if (failed && results.every((result) => result.status === 'rejected')) {
        throw failed.reason;
      }

      return results.filter((result) => result.status === 'fulfilled').length;
    },
    onSettled: () => client.invalidateQueries({ queryKey: USERS_KEY }),
  });
};

/** Old `useUsersInvite`: every row in one request, all or none. */
export const useTeamMembersInvite = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (entries: InviteEntry[]) => api.users.inviteMany({ entries }),
    onSuccess: () => client.invalidateQueries({ queryKey: USERS_KEY }),
  });
};

/** Old `useUserResetPassword`. */
export const useTeamMemberSetPassword = () => {
  const store = useStoreMember();
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; password: string }) => api.users.setPassword(input),
    onSuccess: (user) => {
      store(user);
      void client.invalidateQueries({ queryKey: [...USERS_KEY, 'list'] });
    },
  });
};

/** What the signed-in member may do to `user` (the API enforces the same rules). */
export const permissionsFor = (me: Pick<User, 'id' | 'role'>, user: Pick<User, 'id' | 'role'>) => {
  const self = user.id === me.id;
  const manager = me.role !== 'member';
  const ownerRights = user.role !== 'owner' || me.role === 'owner';

  return {
    canEdit: self || manager,
    canEditEmail: self || (manager && ownerRights),
    canChangeRole: manager && !self && ownerRights,
    canToggle: manager && !self && ownerRights,
    canSetPassword: manager && !self && ownerRights,
    roles: (me.role === 'owner' ? ['owner', 'admin', 'member'] : ['admin', 'member']) as UserRole[],
  };
};

/** `permissionsFor` the signed-in member. */
export const useMemberPermissions = (user: Pick<User, 'id' | 'role'> | undefined) => {
  const { user: me } = useSession();

  return user ? permissionsFor(me, user) : undefined;
};
