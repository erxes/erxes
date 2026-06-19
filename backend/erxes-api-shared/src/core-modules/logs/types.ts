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
  // Gating action for point-in-time revert of this entity; admin/owner bypasses.
  // Defaults conceptually to the entity's destructive REMOVE action — the
  // strongest single proxy for "trusted to destructively mutate this entity".
  permission?: string;
  // Mongoose model name used to resolve the raw model when applying a revert
  // write (e.g. connection.model(mongooseName)). Lets the revert applier reach
  // the live collection without importing a plugin's model classes.
  mongooseName?: string;
}

export interface LogsConfigs {
  contentTypes: ILogContentTypeConfig[];
}
