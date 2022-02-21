import { IBrand as IBrandC } from '@erxes/ui/src/brands/types';
import { MutationVariables } from '@erxes/ui/src/types';

export type IBrand = IBrandC & { emailConfig: any };

export interface IChooseBrand {
  _id?: string;
  name: string;
  brandId: string;
}

export interface IBrandsCount {
  brandsTotalCount: number;
}

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

export type BrandRemoveMutationResponse = {
  removeMutation: (params: {
    variables: MutationVariables;
  }) => Promise<void>;
};

export type EmailConfig = {
  type: string;
  template: string;
};
