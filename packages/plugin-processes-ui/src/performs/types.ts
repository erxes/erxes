import { IBranch, IDepartment } from '@erxes/ui/src/team/types';
import { IProductsData, IProductsDataPerform } from '../types';
import { IUser } from '@erxes/ui/src/auth/types';
import { IOverallWorkKey } from '../overallWork/types';

export type IPerform = {
  _id?: string;
  overallWorkId: string;
  overallWorkKey: IOverallWorkKey;
  type: string;
  typeId: string;
  count: number;
  status: string;
  startAt: Date;
  endAt: Date;
  dueAt: Date;
  description?: string;
  appendix?: string;
  assignedUserIds: string[];
  customerId?: string;
  companyId?: string;
  needProducts: IProductsData[];
  resultProducts: IProductsData[];
  inProducts: IProductsDataPerform[];
  outProducts: IProductsDataPerform[];
  inProductsLen: number;
  outProductsLen: number;
  inDepartmentId?: string;
  inBranchId?: string;
  outDepartmentId?: string;
  outBranchId?: string;

  inDepartment?: IDepartment;
  inBranch?: IBranch;
  outDepartment?: IDepartment;
  outBranch?: IBranch;

  createdAt?: Date;
  createdBy?: string;
  modifiedAt?: Date;
  modifiedBy?: string;
  createdUser?: IUser;
  modifiedUser?: IUser;
  series?: string;
};

export type PerformsQueryResponse = {
  performs: IPerform[];
  loading: boolean;
  refetch: () => void;
};

export type PerformDetailQueryResponse = {
  performDetail: IPerform;
  loading: boolean;
  refetch: () => void;
};

export type PerformsCountQueryResponse = {
  performsCount: number;
  loading: boolean;
  refetch: () => void;
};

export type IPerformAddParams = {
  jobType: string;
  jobReferId: string;
  productId: string;

  inBranchId: string;
  inDepartmentId: string;
  outBranchId: string;
  outDepartmentId: string;
};

export type ICommonParams = {
  count: number;
  startAt: Date;
  endAt: Date;
  status: string;

  needProducts: any;
  resultProducts: any;
};

export type PerformAddMutationResponse = {
  performAdd: (mutation: {
    variables: IPerformAddParams & ICommonParams;
  }) => Promise<any>;
};

export type PerformEditMutationResponse = {
  performEdit: (mutation: {
    variables: IPerformAddParams & ICommonParams & { _id: string };
  }) => Promise<any>;
};

export type PerformConfirmMutationResponse = {
  performConfirm: (mutation: {
    variables: { _id: string; endAt: Date };
  }) => Promise<any>;
};

export type PerformAbortMutationResponse = {
  performAbort: (mutation: { variables: { _id: string } }) => Promise<any>;
};

export type PerformRemoveMutationResponse = {
  performRemove: (mutation: { variables: { _id: string } }) => Promise<any>;
};

export type SeriesPrintConfig = {
  row: number;
  column: number;
  width: number;
  height: number;
  margin: number;
  isSeriesNum: boolean;
  productNameFontSize: number;
  priceFontSize: number;

  isBarcode: boolean;
  barWidth: number;
  barHeight: number;
  barcodeFontSize: number;
  barcodeDescriptionFontSize: number;

  isQrcode: boolean;
  qrSize: number;
};
