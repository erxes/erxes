import { IAttachment } from '@erxes/ui/src/types';
import { IUser } from '@erxes/ui/src/auth/types';

export interface ICarDoc {
  createdAt?: Date;
  modifiedAt?: Date;

  scopeBrandIds?: string[];
  ownerId?: string;
  mergedIds?: string[];
  status?: string;
  description?: string;

  plateNumber?: string;
  vinNumber?: string;
  colorCode?: string;

  bodyType?: string;
  fuelType?: string;
  gearBox?: string;

  vintageYear?: number;
  importYear?: number;

  attachment?: IAttachment;
}

export interface ICar extends ICarDoc {
  _id: string;
  owner: IUser;
  customFieldsData: JSON;
}

// mutation types

export type EditMutationResponse = {
  carsEdit: (params: { variables: ICar }) => Promise<any>;
};

export type RemoveMutationVariables = {
  carIds: string[];
};

export type RemoveMutationResponse = {
  carsRemove: (params: { variables: RemoveMutationVariables }) => Promise<any>;
};

export type AddMutationResponse = {
  carsAdd: (params: { variables: ICarDoc }) => Promise<any>;
};

// query types

export type ListQueryVariables = {
  page?: number;
  perPage?: number;
  segment?: string;
  tag?: string;
  brand?: string;
  ids?: string[];
  searchValue?: string;
  sortField?: string;
  sortDirection?: number;
};

type ListConfig = {
  name: string;
  label: string;
  order: number;
};

export type MainQueryResponse = {
  carsMain: { list: ICar[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type CarsQueryResponse = {
  cars: ICar[];
  loading: boolean;
  refetch: () => void;
};

export type ListConfigQueryResponse = {
  fieldsDefaultColumnsConfig: ListConfig[];
  loading: boolean;
};

export type DetailQueryResponse = {
  carDetail: ICar;
  loading: boolean;
};
