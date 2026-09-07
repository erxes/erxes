import {
  IconBroadcast,
  IconBuilding,
  IconCurrencyDollar,
  IconShoppingCart,
  IconUser,
  IconUsersGroup,
} from '@tabler/icons-react';

interface DocumentTypeConfig {
  icon: React.ElementType;
  label: string;
  color: string;
}

export const DOCUMENTS_TYPES_SET: Record<string, DocumentTypeConfig> = {
  'core:contact.customer': {
    icon: IconUser,
    label: 'Customer',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  'core:contact.company': {
    icon: IconBuilding,
    label: 'Company',
    color: 'bg-violet-100 text-violet-800 border-violet-200',
  },
  'core:product': {
    icon: IconShoppingCart,
    label: 'Product',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  'core:user': {
    icon: IconUsersGroup,
    label: 'Team Member',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  'core:broadcast': {
    icon: IconBroadcast,
    label: 'Broadcast',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  },
  'sales:deal': {
    icon: IconCurrencyDollar,
    label: 'Sales',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
};
