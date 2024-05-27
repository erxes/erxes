import { IUser } from '@erxes/ui/src/auth/types';
import { QueryResponse } from '@erxes/ui/src/types';

export type Risk = {
  _id: string;
  code: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: IUser;
};

export type RisksPaginatedResponse = {
  risksPaginated: {
    risks: Risk[];
    count: number;
  };

  loading: boolean;
  refetch: () => void;
} & QueryResponse;

export type Product = {
  _id: string;
  code: string;
  name: string;
  description?: string;
  riskIds: string[];
  risks: Risk[];
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: IUser;
};

export type ProductsPaginatedResponse = {
  insuranceProductsPaginated: {
    products: Product[];
    count: number;
  };

  loading: boolean;
  refetch: () => void;
} & QueryResponse;
