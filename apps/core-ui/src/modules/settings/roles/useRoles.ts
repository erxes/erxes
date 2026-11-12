import type { Role } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { api } from '~/lib/api';

export const ROLES_KEY = ['roles'];

/** The organisation's roles (built-in and custom). */
export const useRoles = () => {
  const { data } = useQuery({
    queryKey: ROLES_KEY,
    queryFn: () => api.roles.list(),
    staleTime: 60_000,
  });
  const roles: Role[] = data?.data ?? [];
  const byKey = new Map(roles.map((role) => [role.key, role]));

  return {
    roles,
    /** A role's name; built-in keys read well on their own until the list loads. */
    roleName: (key: string) =>
      byKey.get(key)?.name ??
      (key.startsWith('r_') ? '…' : key.charAt(0).toUpperCase() + key.slice(1)),
  };
};
