import { IBranch, IDepartment } from '@erxes/ui/src/team/types';
import { IProduct, IUom } from '@erxes/ui-products/src/types';

export interface IReserveRem {
  _id: string;
  departmentId?: string;
  branchId?: string;
  productId?: string;
  uom?: string;
  remainder: number;
  createdAt?: Date;
  createdBy?: string;
  modifiedAt?: Date;
  modifiedBy?: string;

  branch?: IBranch;
  department?: IDepartment;
  product?: IProduct;
}

export interface IReserveRemParams {
  departmentIds?: string[];
  branchIds?: string[];
  productCategory?: string;
  productId?: string;
  remainder?: number;
}

export type ReserveRemsQueryResponse = {
  reserveRems: IReserveRem[];
  loading: boolean;
  refetch: () => void;
};

export type ReserveRemsCountQueryResponse = {
  reserveRemsCount: number;
  loading: boolean;
  refetch: () => void;
};

export type ReserveRemsRemoveMutationResponse = {
  reserveRemsRemove: (mutation: {
    variables: { _ids: string[] };
  }) => Promise<any>;
};

export type ReserveRemsEditMutationResponse = {
  reserveRemEdit: (mutation: { variables: IReserveRem }) => Promise<any>;
};
