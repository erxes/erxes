import type { User } from '@erxes/core-contract';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useListFilterParams, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { patchCachedRecord, useCursorList } from '~/lib/cursorList';
import { useCan, useSession } from '~/modules/auth/session';
import { TEAM_MEMBER_CURSOR_SESSION_KEY } from './constants';

/**
 * The list's filter bar: its conditions and search. Deactivated members stay out until a
 * condition asks about status, so the list opens on those who work here.
 */
const useTeamMemberFilters = () => {
  const { filter, search } = useListFilterParams();
  const byStatus = filter?.includes('"subject.status"') ?? false;

  return { filter, search, ...(byStatus ? {} : { isActive: true }) };
};

export const useTeamMembers = () => {
  const filters = useTeamMemberFilters();

  return useCursorList<User>({
    sessionKey: TEAM_MEMBER_CURSOR_SESSION_KEY,
    filters,
    options: (paging) =>
      orpc.users.list.infiniteOptions({ input: (page) => ({ ...page, ...filters }), ...paging }),
  });
};

/** One member. */
export const useTeamMember = (id: string | null) =>
  useQuery(orpc.users.get.queryOptions({ input: id ? { id } : skipToken, retry: false }));

/** Puts a changed member everywhere it is shown: lists, its detail and, for yourself, the session. */
const useStoreMember = () => {
  const client = useQueryClient();
  const { user: me } = useSession();

  return (user: User) => {
    patchCachedRecord(client, orpc.users.list.key(), user);
    client.setQueryData(orpc.users.get.queryKey({ input: { id: user.id } }), user);

    if (user.id === me.id) {
      void client.invalidateQueries({ queryKey: orpc.auth.me.key() });
    }
  };
};

/** Saves any member field, toasts on failure. */
export const useTeamMemberEdit = () => {
  const store = useStoreMember();
  const { toast } = useToast();
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  return useMutation(
    orpc.users.update.mutationOptions({
      onSuccess: store,
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('failed-to-update-user-details'),
          description: messageOf(error),
        }),
    }),
  );
};

export const useTeamMemberDisable = () => {
  const client = useQueryClient();
  const store = useStoreMember();
  const { toast } = useToast();
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  return useMutation({
    mutationFn: ({ id, disabled }: { id: string; disabled: boolean }) =>
      disabled ? orpc.users.disable.call({ id }) : orpc.users.enable.call({ id }),
    onSuccess: (user) => {
      store(user);
      // It leaves or joins the "Is active" list.
      void client.invalidateQueries({ queryKey: orpc.users.list.key() });
      toast({
        variant: 'success',
        title:
          user.status === 'disabled'
            ? t('user-deactivated-successfully')
            : t('user-activated-successfully'),
      });
    },
    onError: (error) =>
      toast({ variant: 'destructive', title: t('error'), description: messageOf(error) }),
  });
};

/**
 * Disables several members (command bar), one request each; resolves with how
 * many were disabled and fails only when none were.
 */
export const useTeamMembersDeactivate = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(ids.map((id) => orpc.users.disable.call({ id })));

      const failed = results.find(
        (result): result is PromiseRejectedResult => result.status === 'rejected',
      );

      if (failed && results.every((result) => result.status === 'rejected')) {
        throw failed.reason;
      }

      return results.filter((result) => result.status === 'fulfilled').length;
    },
    onSettled: () => client.invalidateQueries({ queryKey: orpc.users.key() }),
  });
};

/** Invites every row in one request, all or none. */
export const useTeamMembersInvite = () => {
  const client = useQueryClient();

  return useMutation(
    orpc.users.inviteMany.mutationOptions({
      onSuccess: () => client.invalidateQueries({ queryKey: orpc.users.key() }),
    }),
  );
};

/** Adds someone to the team who doesn't sign in. */
export const useTeamMemberAdd = () => {
  const client = useQueryClient();

  return useMutation(
    orpc.users.add.mutationOptions({
      onSuccess: () => client.invalidateQueries({ queryKey: orpc.users.key() }),
    }),
  );
};

/** Lets a member sign in (they get an invitation) or keeps them on the team without it. */
export const useTeamMemberSignIn = () => {
  const store = useStoreMember();
  const { toast } = useToast();
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  return useMutation({
    mutationFn: ({ id, allow }: { id: string; allow: boolean }) =>
      allow ? orpc.users.allowSignIn.call({ id }) : orpc.users.stopSignIn.call({ id }),
    onSuccess: (user) => {
      store(user);
      toast({
        variant: 'success',
        title: user.canSignIn
          ? t('sign-in-allowed', 'Invited: they can sign in once they accept')
          : t('sign-in-stopped', 'They stay on the team without sign-in'),
      });
    },
    onError: (error) =>
      toast({ variant: 'destructive', title: t('error'), description: messageOf(error) }),
  });
};

/** Sets a member's password. */
export const useTeamMemberSetPassword = () => {
  const store = useStoreMember();
  const client = useQueryClient();

  return useMutation(
    orpc.users.setPassword.mutationOptions({
      onSuccess: (user) => {
        store(user);
        void client.invalidateQueries({ queryKey: orpc.users.list.key() });
      },
    }),
  );
};

/** What the signed-in member may do to `user` (the API enforces the same rules). */
export const permissionsFor = (
  me: Pick<User, 'id' | 'role'>,
  user: Pick<User, 'id' | 'role' | 'canSignIn'>,
  can: (action: string) => boolean,
) => {
  const self = user.id === me.id;
  const manager = can('team.manage');
  const ownerRights = user.role !== 'owner' || me.role === 'owner';

  return {
    canEdit: self || manager,
    canEditEmail: self || (manager && ownerRights),
    canChangeRole: manager && !self && ownerRights,
    canToggle: manager && !self && ownerRights,
    canSetPassword: manager && !self && ownerRights && user.canSignIn,
    /** Owners always sign in. */
    canChangeSignIn: manager && !self && user.role !== 'owner',
    /** Only owners grant owner rights (the API also refuses roles wider than yours). */
    canGrantOwner: me.role === 'owner',
  };
};

/** `permissionsFor` the signed-in member. */
export const useMemberPermissions = (user: Pick<User, 'id' | 'role' | 'canSignIn'> | undefined) => {
  const { user: me } = useSession();
  const can = useCan();

  return user ? permissionsFor(me, user, can) : undefined;
};
