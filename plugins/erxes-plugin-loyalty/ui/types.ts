import { ICustomer } from 'erxes-ui/lib/customers/types';
import { IUser } from 'erxes-ui/lib/auth/types';

export type ICustomer = ICustomer;
export interface IItem {
  _id: string;
  name: string;
  order: number;
  stageId: string;
  boardId?: string;
  closeDate: Date;
  description: string;
  amount: number;
  modifiedAt: Date;
  assignedUserIds?: string[];
  assignedUsers: IUser[];
  createdUser?: IUser;
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
}

export interface IPaymentsData {
  [key: string]: {
    currency?: string;
    amount?: number;
  };
}

export interface IDeal extends IItem {
  products?: any;
  paymentsData?: IPaymentsData;
}

export type ILoyalty = {
  _id: string
  modifiedAt: Date,
  customerId: string,
  value: Number,
  dealId: string,
  userId: string,

  customer: ICustomer,
  user?: IUser,
  deal?: IDeal
};

export type ICustomerLoyalty = {
  customerId: string;
  loyalty: Number;
};

// mutation types

// export type EditMutationResponse = {
//   carsEdit: (params: { variables: ICar }) => Promise<any>;
// };

// export type RemoveMutationVariables = {
//   carIds: string[];
// };

// export type RemoveMutationResponse = {
//   carsRemove: (params: { variables: RemoveMutationVariables }) => Promise<any>;
// };

// export type MergeMutationVariables = {
//   carIds: string[];
//   carFields: any;
// };

// export type MergeMutationResponse = {
//   carsMerge: (params: { variables: MergeMutationVariables }) => Promise<any>;
// };

// export type AddMutationResponse = {
//   carsAdd: (params: { variables: ICarDoc }) => Promise<any>;
// };

// query types

export type ListQueryVariables = {
  page?: number;
  perPage?: number;
  customerId?: string;
};

export type CustomerLoyaltiesQueryResponse = {
  customerLoyalties: ILoyalty[];
  loading: boolean;
  refetch: () => void;
};

export type CustomerLoyaltyQueryResponse = {
  customerLoyalty: ICustomerLoyalty;
  loading: boolean;
  refetch: () => void;
};

export type CustomerDetailQueryResponse = {
  customerDetail: ICustomer;
  loading: boolean;
};

// SETTINGS

export type IConfigsMap = { [key: string]: any };

export type IConfig = {
  _id: string;
  code: string;
  value: any;
};

// query types
export type ConfigsQueryResponse = {
  loyaltyConfigs: IConfig[];
  loading: boolean;
  refetch: () => void;
};
