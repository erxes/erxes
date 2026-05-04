export interface IAdjustClosing {
  _id: string;
  createdAt: Date;
  createdBy?: string;
  updatedAt?: Date;
  modifiedBy?: string;

  status?: string;
  date?: Date;
  beginDate?: Date;
  description?: string;

  integrateAccountId?: string;
  periodGLAccountId?: string;
  earningAccountId?: string;
  taxPayableaccountId?: string;
}

export interface IClosingDetailEntry {
  _id?: string;
  accountId?: string;
  balance?: number;
  percent?: number;
  mainAccTrId?: string;
  integrateTrId?: string;
}

export interface IAdjustClosingDetailItem {
  _id: string;
  branchId?: string;
  departmentId?: string;
  entries: IClosingDetailEntry[];
  createdAt?: Date;
}

export interface IAdjustClosingDetail extends IAdjustClosing {
  _id: string;
  details: IAdjustClosingDetailItem[];

  entries: IClosingDetailEntry[];

  status: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface AdjustClosingDetailQueryData {
  adjustClosingDetail: IAdjustClosingDetail;
}

export interface AdjustClosingDetailQueryVariables {
  _id: string;
}
