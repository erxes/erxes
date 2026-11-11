import { IconShieldHalf } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { OptionFilterProps } from '~/components/OptionFilter';
import { ROLE_LABEL } from '../useTeamMembers';

/** Role (owner, admin, member) stands in for old erxes' permission groups. */
export const useRoleFilter = (): OptionFilterProps => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  return {
    filterKey: 'role',
    label: t('role'),
    icon: IconShieldHalf,
    options: Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label })),
  };
};
