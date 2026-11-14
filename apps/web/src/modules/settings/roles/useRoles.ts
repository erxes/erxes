import type { Role } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@erxes/core-contract/client';

/** The organisation's roles (built-in and custom). */
export const rolesQuery = () => orpc.roles.list.queryOptions({ staleTime: 60_000 });

/** Role names for labels; while the list loads or fails, built-in keys read well on their own. */
export const useRoles = () => {
  const { data } = useQuery(rolesQuery());

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
