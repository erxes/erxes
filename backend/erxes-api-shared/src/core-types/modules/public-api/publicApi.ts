export type PublicApiOperationKind = 'query' | 'mutation';

export interface IPublicApiOperation {
  id: string;
  name: string;
  description: string;
  operationName: string;
  kind: PublicApiOperationKind;
  document: string;
  requiredActions: string[];
}

export interface IPublicApiConfig {
  operations: IPublicApiOperation[];
}
