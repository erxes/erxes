import { IconShieldHalf } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { OptionFilterProps } from '~/components/OptionFilter';
import { useRoles } from '../../roles/useRoles';

/** Filters the list by role (owner, admin, member). */
export const useRoleFilter = (): OptionFilterProps => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { roles } = useRoles();

  return {
    filterKey: 'role',
    label: t('role'),
    icon: IconShieldHalf,
    options: roles.map((role) => ({ value: role.key, label: role.name })),
  };
};
