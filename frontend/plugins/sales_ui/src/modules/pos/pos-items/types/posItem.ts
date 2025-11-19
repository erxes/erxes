import { IUser } from '@/pos/types/pos';

export interface IFields {
  odooId?: string;
  odooModel?: string;
  odooSyncDate?: string;
  odooLastError?: string;
}

export interface IPosItem extends IFields {
  _id: string;
  name: string;
  icon: string;
  isOnline: boolean;
  onServer: boolean;
  branchTitle: string;
  departmentTitle: string;
  createdAt: string;
  createdBy: string;
  user: IUser;
  code?: string;
  barcode?: string;
  categoryName?: string;
  firstPrice?: number;
  salePrice?: number;
  discount?: number;
  discountType?: string;
  count?: number;
  amount?: number;
  paymentType?: string;
  customerType?: string;
  customer?: string;
  companyRD?: string;
  factor?: number;
  billType?: string;
  type?: string;
  cashier?: string;
  pos?: string;
  branch?: string;
  department?: string;
  createdDate?: string;
  createdTime?: string;
  number?: string;
  actions?: string;
  posId?: string;
  branchId?: string;
  departmentId?: string;
}

export interface ISyncResult {
  success: boolean;
  message: string;
  syncedCount: number;
  failedCount: number;
  __typename: string;
}

export interface IConnectionStatus {
  isConnected: boolean;
  lastSyncDate?: string;
  totalSyncedItems: number;
  lastError?: string;
  __typename: string;
}
