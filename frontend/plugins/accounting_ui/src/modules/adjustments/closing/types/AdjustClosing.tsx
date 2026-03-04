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

export interface IAdjustClosingDetail extends IAdjustClosing {
  _id: string;
  createdAt: Date;
  updatedAt: Date;

  branchId?: string;
  departmentId?: string;

  entries?: any[];

  closeIntegrateTrId?: string;
  periodGLTrId?: string;
}

export interface AdjustClosingDetailQueryData {
  adjustClosingDetail: IAdjustClosingDetail;
}

export interface AdjustClosingDetailQueryVariables {
  _id: string;
}
