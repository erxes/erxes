import {
  IconAddressBook,
  IconAffiliate,
  IconBuilding,
  IconCategory,
  IconChartPie,
  IconFile,
  IconMagnet,
  IconShoppingCart,
  IconSpiral,
  IconUser,
} from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { TFunction } from 'i18next';

export const GET_CORE_MODULES = (t: TFunction, version?: boolean): IUIConfig['modules'] => {
  const MODULES: IUIConfig['modules'] = [
    {
      name: t('contacts'),
      icon: IconAddressBook,
      path: 'contacts',
      hasSettings: false,
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
      name: t('products'),
      icon: IconShoppingCart,
      path: 'products',
      hasSettings: true,
      submenus: [
        {
          name: 'categories',
          path: 'products/categories',
          icon: IconCategory,
        },
      ],
    },
    {
      name: t('segments'),
      icon: IconChartPie,
      path: 'segments',
      hasSettings: false,
    },
    {
      name: t('automations'),
      icon: IconAffiliate,
      path: 'automations',
      hasSettings: true,
    },
    {
      name: t('logs'),
      path: 'logs',
      settingsOnly: true,
    },
  ];

  if (version) {
    MODULES.push({
      name: t('documents'),
      icon: IconFile,
      path: 'documents',
      hasSettings: false,
    });
  }

  return MODULES;
};
