import {
  ICursorPaginateParams,
  ICustomField,
  IListParams,
} from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export interface IProductData {
  _id?: string;
  productId: string;
  uom: string;
  currency: string;
  quantity: number;
  unitPrice: number;
  globalUnitPrice: number;
  unitPricePercent: number;
  taxPercent?: number;
  tax?: number;
  name?: string;
  vatPercent?: number;
  discountPercent?: number;
  discount?: number;
  bonusCount?: number;
  amount?: number;
  tickUsed?: boolean;
  isVatApplied?: boolean;
  assignUserId?: string;
  branchId?: string;
  departmentId?: string;
  startDate?: Date;
  endDate?: Date;
  parentId?: string;
  information?: JSON;
  extraIds?: [];
}

interface IPaymentsData {
  [key: string]: {
    currency?: string;
    amount?: number;
    info?: any;
  };
}

export interface IDeal {
  name?: string;
  // TODO migrate after remove 2row
  companyIds?: string[];
  customerIds?: string[];
  startDate?: Date;
  closeDate?: Date;
  stageChangedDate?: Date;
  description?: string;
  assignedUserIds?: string[];
  watchedUserIds?: string[];
  notifiedUserIds?: string[];
  labelIds?: string[];
  attachments?: any[];
  stageId: string;
  initialStageId?: string;
  modifiedBy?: string;
  userId?: string;
  order?: number;
  searchText?: string;
  priority?: string;
  sourceConversationIds?: string[];
  status?: string;
  timeTrack?: {
    status: string;
    timeSpent: number;
    startDate?: string;
  };
  customFieldsData?: ICustomField[];
  score?: number;
  number?: string;
  data?: any;
  tagIds?: string[];
  branchIds?: string[];
  departmentIds?: string[];
  parentId?: string;

  productsData?: IProductData[];
  paymentsData?: IPaymentsData;
  extraData?: any;
}

export interface IDealDocument extends IDeal, Document {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;

  customProperties?: Record<string, any>[];
}

export interface IDate {
  month: number;
  year: number;
}

export interface IDealQueryParams extends IListParams, ICursorPaginateParams {
  pipelineId: string;
  pipelineIds: string[];
  stageId: string;
  _ids?: string;
  skip?: number;
  limit?: number;
  date?: IDate;
  search?: string;
  customerIds?: string[];
  companyIds?: string[];
  assignedUserIds?: string[];
  labelIds?: string[];
  userIds?: string[];
  segment?: string;
  segmentData?: string;
  stageChangedStartDate?: Date;
  stageChangedEndDate?: Date;
  noSkipArchive?: boolean;
  tagIds?: string[];
  number?: string;
  productIds?: string[];
}

export interface IArchiveArgs extends ICursorPaginateParams {
  pipelineId: string;
  search: string;
  userIds?: string[];
  priorities?: string[];
  assignedUserIds?: string[];
  labelIds?: string[];
  productIds?: string[];
  companyIds?: string[];
  customerIds?: string[];
  startDate?: string;
  endDate?: string;
  sources?: string[];
  hackStages?: string[];
}
