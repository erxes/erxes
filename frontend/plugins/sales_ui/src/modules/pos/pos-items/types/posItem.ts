export interface IFields {
  odooId?: string;
  odooModel?: string;
  odooSyncDate?: string;
  odooLastError?: string;
}

export interface IBranch {
  order: string;
  title: string;
}

export interface IDepartment {
  order: string;
  title: string;
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
  user: {
    _id: string;
    email: string;
  };
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
  customer?: {
    _id: string;
    primaryEmail: string;
  };
  companyRD?: string;
  factor?: number;
  billType?: string;
  type?: string;
  cashier?: string;
  pos?: string;
  posName?: string;
  number?: string;
  branch?: IBranch;
  department?: IDepartment;
  createdDate?: string;
  createdTime?: string;
  actions?: string;
  posId?: string;
  branchId?: string;
  departmentId?: string;
  items?: Array<{
    productCode?: string;
    productCategoryCode?: string;
    productCategoryName?: string;
    productName?: string;
    count?: number;
    unitPrice?: number;
    discountAmount?: number;
    barcodes?: string[];
  }>;
  paidAmounts?: Array<{
    amount?: number;
  }>;
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
