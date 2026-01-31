import {
  IconAddressBook,
  IconAffiliate,
  IconBroadcast,
  IconBuilding,
  IconCategory,
  IconChartPie,
  IconFile,
  IconMagnet,
  IconShoppingCart,
  IconSpiral,
  IconUser,
} from '@tabler/icons-react';
import { ICoreModule } from 'erxes-ui';
import { TFunction } from 'i18next';

export const GET_CORE_MODULES = (
  t: TFunction,
  version?: boolean,
): ICoreModule[] => {
  const MODULES: ICoreModule[] = [
    {
      name: t('contacts'),
      icon: IconAddressBook,
      path: 'contacts',
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
          name: 'Client Portal Users',
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
    },
    {
      name: t('automations'),
      icon: IconAffiliate,
      path: 'automations',
    },
    {
      name: t('logs'),
      path: 'logs',
      settingsOnly: true,
    },
  ];

  if (version) {
    MODULES?.push(
      {
        name: t('documents'),
        icon: IconFile,
        path: 'documents',
      },
      {
        name: t('broadcasts'),
        icon: IconBroadcast,
        path: 'broadcasts',
      },
    );
  }

  return MODULES;
};
