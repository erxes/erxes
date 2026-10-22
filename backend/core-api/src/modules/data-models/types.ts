import type { Document } from 'mongoose';

export interface IDataModelDefinition {
  _id: string;
  name: string;
  labelSingular: string;
  labelPlural: string;
  description: string;
  icon: string;
  source?: 'BUILTIN' | 'CUSTOM';
  recordLabelField?: string | null;
  recordImageField?: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  archivedAt: Date | null;
  archivedBy: string | null;
}

export interface IDataModelDefinitionDocument
  extends Omit<IDataModelDefinition, '_id'>,
    Document {
  _id: string;
}

export interface IDataModelSystemField {
  code: string;
  name: string;
  type: string;
}

export interface IDataModel {
  _id: string;
  name: string;
  labelSingular: string;
  labelPlural: string;
  description: string;
  icon: string;
  recordLabelField?: string | null;
  recordImageField?: string | null;
  source: 'BUILTIN' | 'CUSTOM';
  contentType: string;
  version: number;
  systemFields: IDataModelSystemField[];
  recordFieldTypes: readonly string[];
  createdAt: Date | null;
  updatedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
  archivedAt: Date | null;
  archivedBy: string | null;
}

export interface IDataModelListParams {
  archived: boolean;
  limit: number;
  offset: number;
}

export interface IDataModelList {
  list: IDataModel[];
  totalCount: number;
}

export type DataModelDefinitionChanges = Partial<
  Pick<
    IDataModelDefinition,
    | 'labelSingular'
    | 'labelPlural'
    | 'description'
    | 'icon'
    | 'recordLabelField'
    | 'recordImageField'
    | 'updatedAt'
    | 'updatedBy'
    | 'archivedAt'
    | 'archivedBy'
  >
>;

export interface IDataModelDefinitionStore {
  builtinOverrides(): Promise<IDataModelDefinition[]>;
  identityFields(modelId: string): Promise<{ _id: string; type: string }[]>;
  list(params: IDataModelListParams): Promise<IDataModelDefinition[]>;
  count(archived: boolean): Promise<number>;
  findById(id: string): Promise<IDataModelDefinition | null>;
  insert(definition: IDataModelDefinition): Promise<IDataModelDefinition>;
  update(
    id: string,
    expectedVersion: number,
    changes: DataModelDefinitionChanges,
  ): Promise<IDataModelDefinition | null>;
}
