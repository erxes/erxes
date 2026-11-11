import type { User, UserRole, UserStatus } from '@erxes/core-contract';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMultiQueryState, useToast } from 'erxes-ui';
import { api, messageOf } from '~/lib/api';
import { patchCachedRecord, useCursorList } from '~/lib/cursorList';

export const USERS_KEY = ['users'];
export const TEAM_MEMBERS_SESSION_KEY = 'core_team_members_cursor';

export const ROLE_LABEL: Record<UserRole, string> = { owner: 'Owner', admin: 'Admin', member: 'Member' };
export const STATUS_LABEL: Record<UserStatus, string> = {
  active: 'Active',
  invited: 'Invited',
  disabled: 'Disabled',
};

export const useTeamMembers = () => {
  const [{ searchValue, status, role }] = useMultiQueryState<{
    searchValue: string;
    status: UserStatus;
    role: UserRole;
  }>(['searchValue', 'status', 'role']);
  const filters = {
    search: searchValue || undefined,
    status: status || undefined,
    role: role || undefined,
  };

  return useCursorList<User>({
    queryKey: [...USERS_KEY, 'list', filters],
    sessionKey: TEAM_MEMBERS_SESSION_KEY,
    fetchPage: (params) => api.users.list({ ...params, ...filters }),
  });
};

export const useTeamMemberEdit = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; fullName?: string; username?: string; role?: UserRole }) =>
      api.users.update({ id, ...body }),
    onSuccess: (user) => patchCachedRecord(client, USERS_KEY, user),
    onError: (error) => toast({ variant: 'destructive', title: 'Could not save', description: messageOf(error) }),
  });
};

export const useTeamMemberDisable = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, disabled }: { id: string; disabled: boolean }) =>
      disabled
        ? api.users.disable({ id })
        : api.users.enable({ id }),
    onSuccess: (user) => {
      patchCachedRecord(client, USERS_KEY, user);
      void client.invalidateQueries({ queryKey: [...USERS_KEY, 'list'] });
      toast({
        variant: 'success',
        title: user.status === 'disabled' ? `${user.email} disabled` : `${user.email} enabled`,
      });
    },
    onError: (error) => toast({ variant: 'destructive', title: 'Could not update', description: messageOf(error) }),
  });
};

/** What the signed-in member may do to `user` (the API enforces the same rules). */
export const permissionsFor = (me: Pick<User, 'id' | 'role'>, user: User) => {
  const self = user.id === me.id;
  const manager = me.role !== 'member';
  const ownerRights = user.role !== 'owner' || me.role === 'owner';

  return {
    canEdit: self || manager,
    canChangeRole: manager && !self && ownerRights,
    canToggle: manager && !self && ownerRights,
    roles: (me.role === 'owner' ? ['owner', 'admin', 'member'] : ['admin', 'member']) as UserRole[],
  };
};
