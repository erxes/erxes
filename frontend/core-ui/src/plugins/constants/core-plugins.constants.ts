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

export const GET_CORE_MODULES = (version?: boolean): IUIConfig['modules'] => {
  const MODULES: IUIConfig['modules'] = [
    {
      name: 'contacts',
      icon: IconAddressBook,
      path: 'contacts',
      hasSettings: false,
      submenus: [
        {
          name: 'customers',
          path: 'contacts/customers',
          icon: IconUser,
        },
        {
          name: 'leads',
          path: 'contacts/leads',
          icon: IconMagnet,
        },
        {
          name: 'companies',
          path: 'contacts/companies',
          icon: IconBuilding,
        },
        {
          name: 'vendors',
          path: 'contacts/vendors',
          icon: IconSpiral,
        },
        {
          name: 'clients',
          path: 'contacts/clients',
          icon: IconSpiral,
        },
      ],
    },
    {
      name: 'logs',
      path: 'logs',
      settingsOnly: true,
    },
  ];

  if (version) {
    MODULES.push(
      {
        name: 'products',
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
        name: 'segments',
        icon: IconChartPie,
        path: 'segments',
        hasSettings: false,
      },
      {
        name: 'automations',
        icon: IconAffiliate,
        path: 'automations',
        hasSettings: true,
      },
      {
        name: 'documents',
        icon: IconFile,
        path: 'documents',
        hasSettings: false,
      },
    );
  }

  return MODULES;
};
