import { QueryResponse } from 'modules/common/types';
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
  responseTemplates: IResponseTemplate[];
  fetchMore: (variables) => void;
} & QueryResponse;

export type ResponseTemplatesTotalCountQueryResponse = {
  responseTemplatesTotalCount: number;
} & QueryResponse;

export type SaveResponseTemplateMutationVariables = {
  brandId: string;
  name: string;
  content?: string;
  files?: any;
};

export type SaveResponseTemplateMutationResponse = {
  saveResponseTemplateMutation: (doc: {
    variables: SaveResponseTemplateMutationVariables;
  }) => Promise<any>;
};
