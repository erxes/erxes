import { IconUserPlus, IconUserX, IconRefresh } from '@tabler/icons-react';

export type CustomerStatus = 'CREATE' | 'UPDATE' | 'DELETE';

export interface ICustomerItem {
  No?: string;
  Name?: string;
  Phone_No?: string;
  E_Mail?: string;
  code?: string;
  primaryPhone?: string;
  primaryEmail?: string;
  unitPrice?: number;
  status: CustomerStatus;
  isSynced?: boolean;
  message?: string;
}

export interface ICheckCustomerResponse {
  update: { items: ICustomerItem[] };
  create: { items: ICustomerItem[] };
  delete: { items: ICustomerItem[] };
}

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  CREATE: 'Create customers',
  UPDATE: 'Update customers',
  DELETE: 'Delete customers',
};

export const CUSTOMER_STATUS_ICONS: Record<
  CustomerStatus,
  typeof IconUserPlus
> = {
  CREATE: IconUserPlus,
  UPDATE: IconRefresh,
  DELETE: IconUserX,
};

export const CUSTOMER_STATUS_CLASSES: Record<CustomerStatus, string> = {
  CREATE: 'text-blue-600',
  UPDATE: 'text-amber-600',
  DELETE: 'text-red-600',
};
