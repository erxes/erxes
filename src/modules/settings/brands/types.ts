export interface IBrand {
  _id: string;
  code: string;
  name?: string;
  createdAt: string;
  description?: string;
  emailConfig: { type: string; template: string };
}

export interface IBrandsCount {
  brandsTotalCount: number;
}

// queries

export type BrandsQueryResponse = {
  brands: IBrand[];
  loading: boolean;
  refetch: () => void;
};

export type BrandDetailQueryResponse = {
  brandDetail: IBrand;
  loading: boolean;
  refetch: () => void;
};

export type BrandsGetLastQueryResponse = {
  brandsGetLast: IBrand;
  loading: boolean;
  refetch: () => void;
};

export type BrandsCountQueryResponse = {
  brandsTotalCount: number;
  loading: boolean;
  refetch: () => void;
};

// mutation

export type BrandsManageIntegrationsMutationVariables = {
  _id: string;
  integrationIds: [string];
};

export type BrandsManageIntegrationsMutationResponse = {
  saveMutation: (
    params: {
      variables: BrandsManageIntegrationsMutationVariables;
    }
  ) => Promise<void>;
};

export type BrandMutationVariables = {
  name: string;
  description: string;
};

export type BrandAddMutationResponse = {
  addMutation: (
    params: {
      variables: BrandMutationVariables;
    }
  ) => Promise<void>;
};

export type BrandEditMutationResponse = {
  editMutation: (
    params: {
      variables: BrandMutationVariables;
    }
  ) => Promise<void>;
};

export type BrandRemoveMutationVariables = {
  _id: string;
};

export type BrandRemoveMutationResponse = {
  removeMutation: (
    params: {
      variables: BrandRemoveMutationVariables;
    }
  ) => Promise<void>;
};
