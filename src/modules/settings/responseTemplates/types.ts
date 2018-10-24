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
  refetch: () => void;
};

export type SaveResponsTemplateMutationVariables = {
  brandId: string;
  name: string;
  content?: string;
  files?: any;
};

export type SaveResponseTemplateMutationResponse = {
  saveResponseTemplateMutation: (
    doc: {
      variables: SaveResponsTemplateMutationVariables;
    }
  ) => Promise<any>;
};
