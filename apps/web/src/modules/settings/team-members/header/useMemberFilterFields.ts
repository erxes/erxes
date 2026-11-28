import {
  IconAt,
  IconCalendar,
  IconCalendarPlus,
  IconCircleDot,
  IconId,
  IconLetterCase,
  IconLogin,
  IconMail,
  IconPhone,
  IconShieldHalf,
} from '@tabler/icons-react';
import type { TListFilterField } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useRoles } from '../../roles/useRoles';

/**
 * What the team members list filters by, on the paths the API compiles
 * (`apps/api/src/modules/users/userFilter.ts`).
 */
export const useMemberFilterFields = (): TListFilterField[] => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { roles } = useRoles();

  return [
    {
      path: 'subject.role',
      label: t('role'),
      type: 'select',
      icon: IconShieldHalf,
      options: roles.map((role) => ({ value: role.key, label: role.name })),
    },
    {
      path: 'subject.status',
      label: t('status'),
      type: 'select',
      icon: IconCircleDot,
      options: [
        { value: 'active', label: t('status-active', 'Active') },
        { value: 'invited', label: t('status-invited', 'Invited') },
        { value: 'disabled', label: t('status-disabled', 'Deactivated') },
      ],
    },
    {
      path: 'subject.canSignIn',
      label: t('signs-in', 'Signs in'),
      type: 'boolean',
      icon: IconLogin,
    },
    { path: 'subject.fullName', label: t('name'), type: 'text', icon: IconLetterCase },
    { path: 'subject.email', label: t('email'), type: 'text', icon: IconMail },
    { path: 'subject.phone', label: t('phone'), type: 'text', icon: IconPhone },
    { path: 'subject.employeeId', label: t('employeeId'), type: 'text', icon: IconId },
    { path: 'subject.birthDate', label: t('birthday'), type: 'date', icon: IconCalendar },
    {
      path: 'subject.workStartedDate',
      label: t('joined-date'),
      type: 'date',
      icon: IconCalendarPlus,
    },
    { path: 'subject.createdAt', label: t('date-created'), type: 'date', icon: IconAt },
  ];
};
