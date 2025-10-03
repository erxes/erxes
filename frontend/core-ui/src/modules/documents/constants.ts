import {
  IconBuilding,
  IconShoppingCart,
  IconUser,
  IconUsersGroup,
} from '@tabler/icons-react';

interface DocumentTypeConfig {
  icon: React.ElementType;
  label: string;
}

export const DOCUMENTS_TYPES_SET: Record<string, DocumentTypeConfig> = {
  'core:customer': {
    icon: IconUser,
    label: 'Customer',
  },
  'core:company': {
    icon: IconBuilding,
    label: 'Company',
  },
  'core:product': {
    icon: IconShoppingCart,
    label: 'Product',
  },
  'core:user': {
    icon: IconUsersGroup,
    label: 'Team Member',
  },
};
