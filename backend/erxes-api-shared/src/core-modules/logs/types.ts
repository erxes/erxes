export enum TAfterProcessProducers {
  AFTER_MUTATION = 'afterMutation',
  AFTER_AUTH = 'afterAuth',
  AFTER_API_REQUEST = 'afterApiRequest',
  AFTER_DOCUMENT_UPDATED = 'afterDocumentUpdated',
  AFTER_DOCUMENT_CREATED = 'afterDocumentCreated',
}

export interface ILogContentTypeConfig {
  moduleName: string;
  collectionName: string;
}

export interface LogsConfigs {
  contentTypes: ILogContentTypeConfig[];
}
