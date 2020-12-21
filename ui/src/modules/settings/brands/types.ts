import { IBrand as IBrandC } from 'erxes-ui/lib/types';
import { QueryResponse } from 'modules/common/types';
import { IIntegration } from 'modules/settings/integrations/types';

export type IBrand = IBrandC;

export interface IChooseBrand {
  _id?: string;
  name: string;
  brandId: string;
}

export interface IBrandDoc extends IBrand {
  integrations: IIntegration[];
}

export interface IBrandsCount {
  brandsTotalCount: number;
}

// queries
export type BrandsQueryResponse = {
  brands: IBrand[];
} & QueryResponse;

export type BrandDetailQueryResponse = {
  brandDetail: IBrand;
} & QueryResponse;

export type BrandsGetLastQueryResponse = {
  brandsGetLast: IBrand;
} & QueryResponse;

export type BrandsCountQueryResponse = {
  brandsTotalCount: number;
} & QueryResponse;

// mutation

export type BrandsManageIntegrationsMutationVariables = {
  _id: string;
  integrationIds: string[];
};

export type BrandsManageIntegrationsMutationResponse = {
  saveMutation: (params: {
    variables: BrandsManageIntegrationsMutationVariables;
  }) => Promise<void>;
};

export type BrandRemoveMutationVariables = {
  _id: string;
};

export type BrandRemoveMutationResponse = {
  removeMutation: (params: {
    variables: BrandRemoveMutationVariables;
  }) => Promise<void>;
};

export type EmailConfig = {
  type: string;
  template: string;
};

export type BrandsConfigEmailMutationVariables = {
  _id: string;
  emailConfig: EmailConfig;
};

export type BrandsConfigEmailMutationResponse = {
  configEmailMutation: (params: {
    variables: BrandsConfigEmailMutationVariables;
  }) => Promise<void>;
};
