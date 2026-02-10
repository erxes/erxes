import { IBranch, ICompany, ICustomer, IDepartment, IProductData, ITag, IUser } from "ui-modules";
import { IPipeline, IPipelineLabel } from "./pipelines";

import { IAttachment } from "./attachments";
import { IStage } from "./stages";

export interface IItem {
    _id: string;
    name: string;
    order: number;
    boardId?: string;
    startDate: Date;
    closeDate: Date;
    description: string;
    unusedAmount?: number;
    amount: number;
    modifiedAt: Date;
    assignedUserIds?: string[];
    assignedUsers: IUser[];
    createdUser?: IUser;
    companies: ICompany[];
    customers: ICustomer[];
    attachments?: IAttachment[];
    labels: IPipelineLabel[];
    pipeline: IPipeline;
    pipelineId?: string;
    stage?: IStage;
    stageId?: string;
    columnId?: string;
    isWatched?: boolean;
    priority?: string;
    hasNotified?: boolean;
    isComplete: boolean;
    reminderMinute: number;
    labelIds: string[];
    status?: string;
    createdAt: Date;
    timeTrack: {
      status: string;
      timeSpent: number;
      startDate?: string;
    };
    customFieldsData?: {
      [key: string]: any;
    };
    score?: number;
    number?: string;
    relations: any[];
    tags: ITag[];
    tagIds: string[];
    customProperties?: any;
    propertiesData?: Record<string, any>;
    departmentIds: string[];
    branchIds: string[];
  }

  export interface IPaymentsData {
    [key: string]: {
      currency?: string;
      amount?: number;
      info?: any;
    };
  }

  export interface IDealList {
    list: IDeal[];
    pageInfo: {
      endCursor: string;
      startCursor: string;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    totalCount: number;
  }
  
export interface IDeal extends IItem {
    products?: any[];
    productsData?: IProductData[];
    paymentsData?: IPaymentsData;
    departments?: IDepartment[];
    branches?: IBranch[];
  }

export type dealsProductDataMutationParams = {
    processId?: string;
    dealId?: string;
    dataId?: string;
    doc?: any;
    docs?: any;
  }
  
  export type DealsQueryResponse = {
    deals: IDeal[];
    loading: boolean;
    refetch: () => void;
    fetchMore: any;
  };
  
  export type DealsTotalCountQueryResponse = {
    dealsTotalCount: number;
    loading: boolean;
    refetch: () => void;
    fetchMore: any;
  };
  