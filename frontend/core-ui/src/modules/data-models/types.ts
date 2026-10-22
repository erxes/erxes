export interface DataModel {
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
  systemFields: { code: string; name: string; type: string }[];
  recordFieldTypes: string[];
  archivedAt: string | null;
}

export interface DataModelRecord {
  _id: string;
  dataModelId: string;
  values: Record<string, unknown>;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  deletedAt: string | null;
  deletedBy: string | null;
}

export interface ModelField {
  _id: string;
  dataModelId: string;
  name: string;
  label: string;
  description: string;
  type: string;
  required: boolean;
  options: { label: string; value: string }[];
  version: number;
  archivedAt: string | null;
  relation?: {
    targetModelId: string;
    multiple: boolean;
    inverseFieldId: string;
    isInverse: boolean;
    morphId?: string | null;
    morphName?: string | null;
    morphSize?: number | null;
    targetModelName?: string | null;
    targetModelLabel?: string | null;
  } | null;
}

export interface OffsetList<T> {
  list: T[];
  totalCount: number;
}

export interface DataModelRelationOption {
  _id: string;
  label: string;
  imageUrl?: string | null;
}

export const DATA_MODEL_CONTENT_TYPE_PREFIX = 'core:dataModel_';

export const DATA_MODELS_PATH = '/settings/data-models';
export const DATA_MODEL_PAGE_SIZE = 25;

export const modelPath = (id: string): string =>
  `${DATA_MODELS_PATH}/${encodeURIComponent(id)}`;

export const DATA_MODEL_FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Long text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Yes / no' },
  { value: 'date', label: 'Date and time' },
  { value: 'phone', label: 'Phone' },
  { value: 'list', label: 'Text list' },
  { value: 'select', label: 'Single select' },
  { value: 'multiSelect', label: 'Multiple select' },
  { value: 'relation', label: 'Relation' },
];
