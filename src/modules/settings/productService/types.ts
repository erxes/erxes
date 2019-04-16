export interface IProductDoc {
  _id?: string;
  type: string;
  name?: string;
  description?: string;
  sku?: string;
  createdAt?: Date;
}

export interface IProduct {
  _id: string;
  name: string;
  type: string;
  description: string;
  sku: string;
  createdAt: Date;
}

// query types

export type ProductsQueryResponse = {
  products: IProduct[];
  loading: boolean;
  refetch: () => void;
};

export type ProductsCountQueryResponse = {
  productsTotalCount: number;
  loading: boolean;
  refetch: () => void;
};

export type MutationVariables = {
  _id?: string;
  type: string;
  name?: string;
  description?: string;
  sku?: string;
  createdAt?: Date;
};

// mutation types

export type AddMutationResponse = {
  addMutation: (mutation: { variables: MutationVariables }) => Promise<any>;
};

export type EditMutationResponse = {
  editMutation: (mutation: { variables: MutationVariables }) => Promise<any>;
};

export type RemoveMutationResponse = {
  removeMutation: (mutation: { variables: { _id: string } }) => Promise<any>;
};
