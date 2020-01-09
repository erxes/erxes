import { IBrand } from '../brands/types';

export interface IResponseTemplate {
  _id: string;
  name: string;
  content: string;
  brandId: string;
  brand: IBrand;
  files: any;
}

export type ResponseTemplatesQueryResponse = {
  loading: boolean;
  responseTemplates: IResponseTemplate[];
  fetchMore: (variables) => void;
  refetch: () => void;
};

export type ResponseTemplatesTotalCountQueryResponse = {
  loading: boolean;
  responseTemplatesTotalCount: number;
  refetch: () => void;
};

export type SaveResponseTemplateMutationVariables = {
  brandId: string;
  name: string;
  content?: string;
  files?: any;
};

export type SaveResponseTemplateMutationResponse = {
  saveResponseTemplateMutation: (
    doc: {
      variables: SaveResponseTemplateMutationVariables;
    }
  ) => Promise<any>;
};
