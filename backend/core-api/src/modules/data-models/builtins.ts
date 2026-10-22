import { properties } from '~/meta/properties';
import type { IDataModel, IDataModelSystemField } from './types';

const pluralLabels: Record<string, string> = {
  customer: 'Customers',
  company: 'Companies',
  product: 'Products & Services',
  user: 'Team members',
};
const icons: Record<string, string> = {
  customer: 'IconUsers',
  company: 'IconBuilding',
  product: 'IconPackage',
  user: 'IconUsers',
};

// These are descriptions of existing entities, never copies of their records.
export const getBuiltinDataModels = (): IDataModel[] =>
  properties.types.map((type) => ({
    _id: `core:${type.type}`,
    name: type.type,
    labelSingular: type.description,
    labelPlural: pluralLabels[type.type] ?? type.description,
    description: type.description,
    icon: icons[type.type] ?? 'IconDatabase',
    recordLabelField: null,
    recordImageField: null,
    source: 'BUILTIN',
    contentType: `core:${type.type}`,
    version: 1,
    recordFieldTypes: [],
    systemFields: (type.systemFields ?? []).map(({ code, name, type }) => ({
      code,
      name,
      type,
    })),
    createdAt: null,
    updatedAt: null,
    createdBy: null,
    updatedBy: null,
    archivedAt: null,
    archivedBy: null,
  }));

export const getCustomDataModelSystemFields = (): IDataModelSystemField[] => [
  { code: '_id', name: 'ID', type: 'text' },
  { code: 'createdAt', name: 'Created at', type: 'date' },
  { code: 'updatedAt', name: 'Updated at', type: 'date' },
  { code: 'createdBy', name: 'Created by', type: 'relation' },
  { code: 'updatedBy', name: 'Updated by', type: 'relation' },
  { code: 'version', name: 'Version', type: 'number' },
  { code: 'deletedAt', name: 'Deleted at', type: 'date' },
  { code: 'deletedBy', name: 'Deleted by', type: 'relation' },
];
