import type { Role } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { orpc } from '@erxes/core-contract/client';
import enSettings from '~/i18n/locales/en/settings.json';

/** The organisation's roles (built-in and custom). */
export const rolesQuery = () => orpc.roles.list.queryOptions({ staleTime: 60_000 });

/** The built-in roles' words as core seeds them, in English. */
const SEEDED = enSettings.roles.builtin;

const isBuiltin = (key: string): key is keyof typeof SEEDED => Object.hasOwn(SEEDED, key);

/**
 * A role as the member reads it: a built-in role's seeded name and description in the member's
 * language; words the organisation wrote itself as written.
 */
export const useRoleText = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'roles.builtin' });

  return (role: Role): Role => {
    if (!isBuiltin(role.key)) return role;

    const seeded = SEEDED[role.key];

    return {
      ...role,
      name: role.name === seeded.name ? t(`${role.key}.name`) : role.name,
      description:
        role.description === seeded.description ? t(`${role.key}.description`) : role.description,
    };
  };
};

/** The roles, as the member reads them, and a role's name by key. */
export const useRoles = () => {
  const { data } = useQuery(rolesQuery());
  const { t } = useTranslation('settings', { keyPrefix: 'roles.builtin' });
  const roleText = useRoleText();

  const roles = (data?.data ?? []).map(roleText);
  const byKey = new Map(roles.map((role) => [role.key, role]));

  return {
    roles,
    /** A role's name; built-in keys read well on their own until the list loads. */
    roleName: (key: string) => byKey.get(key)?.name ?? (isBuiltin(key) ? t(`${key}.name`) : '…'),
  };
};
