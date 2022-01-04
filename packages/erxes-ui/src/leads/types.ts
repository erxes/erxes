import { IBrand, QueryResponse } from 'types';

export interface IForm {
  _id: string;
  code?: string;
}

export interface ILeadIntegration {
  _id: string;
  name: string;
  code: string;
  kind: string;
  brand: IBrand;
  form: IForm;
}

export type LeadIntegrationsQueryResponse = {
  integrations: ILeadIntegration[];
} & QueryResponse;
