export interface AdjustClosing {
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

export interface AdjustClosingDetail {
  _id: string;
  createdAt: Date;
  updatedAt: Date;

  branchId?: string;
  departmentid?: string;

  entries?: any[];

  closeIntegrateTrId?: string;
  periodGLTrId?: string;
}
