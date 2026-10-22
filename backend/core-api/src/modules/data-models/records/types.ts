import type { Document } from 'mongoose';

export const DATA_MODEL_RECORD_FIELD_TYPES = [
  'text',
  'textarea',
  'phone',
  'list',
  'number',
  'boolean',
  'date',
  'select',
  'radio',
  'multiSelect',
  'check',
  'relation',
] as const;

export interface IDataModelRecord {
  _id: string;
  dataModelId: string;
  propertiesData: Record<string, unknown>;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  deletedAt: Date | null;
  deletedBy: string | null;
}

export interface IDataModelRecordDocument
  extends Omit<IDataModelRecord, '_id'>,
    Document {
  _id: string;
}

export interface IDataModelRecordField {
  _id: string;
  name: string;
  code: string;
  type: string;
  options?: { label: string; value: string; deprecated?: boolean }[];
  isRequired?: boolean;
  validations?: unknown;
  archivedAt?: Date;
  owned: boolean;
  groupAvailable: boolean;
  repeating: boolean;
  relation?: {
    targetModelId: string;
    multiple: boolean;
    inverseFieldId: string;
    isInverse: boolean;
    morphId?: string;
    morphName?: string;
    morphSize?: number;
  };
}

export interface IDataModelRecordFields {
  list(dataModelId: string): Promise<IDataModelRecordField[]>;
  validate(fieldId: string, value: unknown): Promise<void>;
}

export interface IDataModelRecordQuery {
  filter: Record<string, unknown>;
  sort: Record<string, 1 | -1>;
  limit: number;
  offset: number;
  deleted: boolean;
}

export interface IDataModelRecordList {
  list: IDataModelRecord[];
  totalCount: number;
}

export type DataModelRecordChanges = Pick<
  IDataModelRecord,
  'propertiesData' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;

export interface IDataModelRecordStore {
  list(query: IDataModelRecordQuery): Promise<IDataModelRecord[]>;
  count(query: IDataModelRecordQuery): Promise<number>;
  get(id: string, deleted: boolean): Promise<IDataModelRecord | null>;
  insert(record: IDataModelRecord): Promise<IDataModelRecord>;
  update(
    id: string,
    expectedVersion: number,
    deleted: boolean,
    changes: DataModelRecordChanges,
  ): Promise<IDataModelRecord | null>;
}

export type DataModelRecordEvent =
  | { action: 'create'; current: IDataModelRecord }
  | {
      action: 'update' | 'delete';
      previous: IDataModelRecord;
      current: IDataModelRecord;
    };

export type DataModelRecordEventSink = (
  modelId: string,
  event: DataModelRecordEvent,
) => void;
