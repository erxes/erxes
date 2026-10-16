import {
  IconAddressBook,
  IconAffiliate,
  IconBrandDatabricks,
  IconBroadcast,
  IconBuilding,
  IconChartPie,
  IconFile,
  IconLayoutGrid,
  IconMagnet,
  IconSpiral,
  IconUser,
} from '@tabler/icons-react';
import { ICoreModule } from 'erxes-ui';
import { TFunction } from 'i18next';
import { AutomationsAbsolutePath } from '@/types/paths/AutomationPath';

export const GET_CORE_MODULES = (
  t: TFunction,
  version?: boolean,
): ICoreModule[] => {
  const MODULES: ICoreModule[] = [
    {
      name: t('contacts'),
      icon: IconAddressBook,
      path: 'contacts',
      description: t('contacts-description'),
      submenus: [
        {
          name: t('customers'),
          path: 'contacts/customers',
          icon: IconUser,
        },
        {
          name: t('leads'),
          path: 'contacts/leads',
          icon: IconMagnet,
        },
        {
          name: t('companies'),
          path: 'contacts/companies',
          icon: IconBuilding,
        },
        {
          name: t('client-portal-users'),
          path: 'contacts/client-portal-users',
          icon: IconUser,
        },
        {
          name: t('vendors'),
          path: 'contacts/vendors',
          icon: IconSpiral,
        },
        {
          name: t('clients'),
          path: 'contacts/clients',
          icon: IconSpiral,
        },
      ],
    },
    {
      name: t('segments'),
      icon: IconChartPie,
      path: 'segments',
      description: t('segments-description'),
    },
    {
      name: t('automations'),
      icon: IconAffiliate,
      path: 'automations',
      description: t('automations-description'),
      submenus: [
        {
          name: t('automations'),
          path: 'automations',
          icon: IconAffiliate,
        },
        {
          name: t('templates'),
          path: AutomationsAbsolutePath.Templates.slice(1),
          icon: IconLayoutGrid,
        },
      ],
    },
    {
      name: t('logs'),
      path: 'logs',
      settingsOnly: true,
    },
    {
      name: t('broadcasts'),
      icon: IconBroadcast,
      path: 'broadcasts',
      description: t('broadcasts-description'),
    },
    {
      name: t('documents'),
      icon: IconFile,
      path: 'documents',
      description: t('documents-description'),
    },
  ];

  if (version) {
    MODULES?.push({
      name: t('templates'),
      icon: IconBrandDatabricks,
      path: 'templates',
      description: t('templates-description'),
    });
  }

  return MODULES;
};
